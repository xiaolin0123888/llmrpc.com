import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { execute } from '@/lib/db'
import { getPayPalAccess, isPayPalConfigured } from '@/lib/paypal'
import { safeJson } from '@/lib/safe-json'

const PAYPAL_TIMEOUT_MS = 30_000

const CREDIT_PACKAGES: Record<string, { tokens: number; price: string }> = {
  '100K': { tokens: 100_000,  price: '1.00' },
  '500K': { tokens: 500_000,  price: '5.00' },
  '1M':   { tokens: 1_000_000, price: '10.00' },
  '5M':   { tokens: 5_000_000, price: '45.00' },
}

function abortableFetch(url: string, init: RequestInit, timeoutMs: number): ReturnType<typeof fetch> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [body, parseError] = await safeJson<{ package?: string }>(req)
    if (parseError) return parseError

    const pkgKey = body?.package
    const pkg = pkgKey ? CREDIT_PACKAGES[pkgKey] : null
    if (!pkgKey || !pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://llmrpc.com'
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'PayPal is temporarily unavailable' }, { status: 503 })
    }

    const { accessToken, baseUrl: paypalBaseUrl } = await getPayPalAccess()

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: pkg.price },
        description: `Credits: ${pkg.tokens.toLocaleString()} tokens`,
        custom_id: JSON.stringify({ userId: session.user.userId, tokens: pkg.tokens, package: pkgKey }),
      }],
      application_context: {
        brand_name: 'LLMCluster',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${baseUrl}/billing?paypal=success`,
        cancel_url: `${baseUrl}/billing?paypal=cancelled`,
      },
    }

    const ppRes = await abortableFetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    }, PAYPAL_TIMEOUT_MS)

    if (!ppRes.ok) {
      const err = await ppRes.text()
      console.error('[paypal create-order error]', err)
      return NextResponse.json({ error: 'PayPal order creation failed' }, { status: 502 })
    }

    const order = await ppRes.json()

    // Store pending transaction
    await execute(
      `INSERT INTO transactions (user_id, type, amount, description, metadata)
       VALUES ($1, 'PURCHASE', $2, $3, $4::jsonb)`,
      [
        session.user.userId,
        pkg.tokens,
        `PayPal order created: ${pkg.tokens.toLocaleString()} tokens (${pkg.price} USD)`,
        JSON.stringify({ provider: 'paypal', orderId: order.id, status: 'pending', tokens: pkg.tokens, price: pkg.price }),
      ]
    )

    return NextResponse.json({
      orderId: order.id,
      approveUrl: order.links?.find((l: any) => l.rel === 'approve')?.href,
    })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[paypal create-order] PayPal request timed out')
      return NextResponse.json({ error: 'PayPal request timed out' }, { status: 504 })
    }
    console.error('[paypal create-order]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
