function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

export class PayPalAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "PayPalAuthError"
    this.status = status
  }
}

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export async function getPayPalAccess(): Promise<{ accessToken: string; baseUrl: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("PayPal not configured")

  const baseUrl = getPayPalBaseUrl()
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let response: Response
  try {
    response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const upstreamStatus = response.status
    const clientStatus = upstreamStatus === 401 || upstreamStatus === 403 ? 502 : 503
    throw new PayPalAuthError(`PayPal authentication failed (${upstreamStatus})`, clientStatus)
  }

  let data: { access_token?: string }
  try {
    data = await response.json() as { access_token?: string }
  } catch {
    throw new PayPalAuthError("PayPal returned unparseable response during auth", 502)
  }

  if (!data.access_token) throw new PayPalAuthError("PayPal access token missing in response", 502)

  return { accessToken: data.access_token, baseUrl }
}

/**
 * Verify PayPal webhook signature.
 * Per PayPal docs: POST /v1/notifications/verify-webhook-signature
 */
export async function verifyPaypalWebhookSignature(
  rawBody: string,
  headers: {
    "paypal-auth-algo": string | null
    "paypal-cert-url": string | null
    "paypal-transmission-id": string | null
    "paypal-transmission-sig": string | null
    "paypal-transmission-time": string | null
  }
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error("[paypal webhook verify] PAYPAL_WEBHOOK_ID not configured")
    return false
  }

  try {
    const { accessToken, baseUrl } = await getPayPalAccess()

    const verifyBody = JSON.stringify({
      auth_algo: headers["paypal-auth-algo"] || "",
      cert_url: headers["paypal-cert-url"] || "",
      transmission_id: headers["paypal-transmission-id"] || "",
      transmission_sig: headers["paypal-transmission-sig"] || "",
      transmission_time: headers["paypal-transmission-time"] || "",
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    let verifyRes: Response
    try {
      verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: verifyBody,
        cache: "no-store",
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!verifyRes.ok) {
      console.error("[paypal webhook verify] Verification API returned", verifyRes.status)
      return false
    }

    const result = await verifyRes.json() as { verification_status?: string }
    return result.verification_status === "SUCCESS"
  } catch (err) {
    console.error("[paypal webhook verify] Error:", err)
    return false
  }
}
