import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { execute } from "@/lib/db"
import { getPayPalAccess, isPayPalConfigured, PayPalAuthError } from "@/lib/paypal"
import { safeJson } from "@/lib/safe-json"

const PAYPAL_TIMEOUT_MS = 30_000

const PLAN_PRICING: Record<string, { planId: string | undefined; price: string; quota: string; name: string }> = {
  basic:      { planId: process.env.PAYPAL_PLAN_BASIC,      price: "9.99",  quota: "500K tokens/mo",  name: "Basic" },
  pro:        { planId: process.env.PAYPAL_PLAN_PRO,        price: "49.00", quota: "20M tokens/mo",   name: "Pro" },
  enterprise: { planId: process.env.PAYPAL_PLAN_ENTERPRISE, price: "99.00", quota: "50M tokens/mo",   name: "Enterprise" },
  unlimited:  { planId: process.env.PAYPAL_PLAN_UNLIMITED,  price: "199.00",quota: "500M tokens/mo", name: "500M" },
}

function abortableFetch(url: string, init: RequestInit, timeoutMs: number): ReturnType<typeof fetch> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && (
    err.message.includes("fetch") || err.message.includes("network") ||
    err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED") ||
    err.message.includes("ETIMEDOUT") || err.message.includes("certificate") ||
    err.message.includes("TLS") || err.cause !== undefined
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [body, parseError] = await safeJson<{ plan?: string }>(req)
    if (parseError) return parseError

    const planKey = body?.plan?.toLowerCase()
    const plan = planKey ? PLAN_PRICING[planKey] : undefined
    if (!planKey || !plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    if (!plan.planId) return NextResponse.json({ error: "Plan not configured" }, { status: 503 })

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal is temporarily unavailable" }, { status: 503 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://llmrpc.com"
    const { accessToken, baseUrl: paypalBaseUrl } = await getPayPalAccess()

    const payload = {
      plan_id: plan.planId,
      subscriber: {
        name: { given_name: session.user.userId.slice(0, 20) },
      },
      custom_id: JSON.stringify({ userId: session.user.userId, plan: planKey }),
      application_context: {
        brand_name: "LLMRpc",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${baseUrl}/billing?paypal_sub=success`,
        cancel_url: `${baseUrl}/billing?paypal_sub=cancelled`,
      },
    }

    const ppRes = await abortableFetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    }, PAYPAL_TIMEOUT_MS)

    if (!ppRes.ok) {
      const err = await ppRes.text()
      console.error("[paypal create-subscription error]", err)
      return NextResponse.json({ error: "PayPal subscription creation failed" }, { status: 502 })
    }

    const subscription = await ppRes.json()

    // Store pending subscription record
    await execute(
      `INSERT INTO subscriptions (user_id, plan, status, paypal_sub_id, current_period_start, current_period_end)
       VALUES ($1, $2, 'PENDING', $3, NOW(), NOW() + INTERVAL '1 month')
       ON CONFLICT (paypal_sub_id) DO NOTHING`,
      [session.user.userId, plan.name.toUpperCase(), subscription.id]
    )

    return NextResponse.json({
      subscriptionId: subscription.id,
      approveUrl: subscription.links?.find((l: any) => l.rel === "approve")?.href,
    })
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error("[paypal create-subscription] PayPal request timed out")
      return NextResponse.json({ error: "PayPal request timed out" }, { status: 504 })
    }
    if (err instanceof PayPalAuthError) {
      console.error("[paypal create-subscription]", err.message)
      return NextResponse.json({ error: "PayPal service temporarily unavailable" }, { status: err.status })
    }
    if (isNetworkError(err)) {
      console.error("[paypal create-subscription] Network error:", err.message)
      return NextResponse.json({ error: "PayPal service unreachable" }, { status: 503 })
    }
    console.error("[paypal create-subscription]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
