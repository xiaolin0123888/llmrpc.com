function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export async function getPayPalAccess(): Promise<{ accessToken: string; baseUrl: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('PayPal not configured')

  const baseUrl = getPayPalBaseUrl()
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let response: Response
  try {
    response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status})`)

  const data = await response.json() as { access_token?: string }
  if (!data.access_token) throw new Error('PayPal access token missing')

  return { accessToken: data.access_token, baseUrl }
}
