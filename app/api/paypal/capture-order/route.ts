import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, prisma } from '@/lib/db'
import { getPayPalAccess, isPayPalConfigured, PayPalAuthError } from '@/lib/paypal'
import { safeJson } from '@/lib/safe-json'

const PAYPAL_TIMEOUT_MS = 30_000

function abortableFetch(url: string, init: RequestInit, timeoutMs: number): ReturnType<typeof fetch> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [body, parseError] = await safeJson<{ orderId?: string }>(req)
    if (parseError) return parseError

    const orderId = body?.orderId
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    // ── Step 1: Find and validate local transaction BEFORE calling PayPal ──
    const dbTx = await getOne(
      `SELECT * FROM transactions
       WHERE user_id = $1 AND type = 'PURCHASE' AND metadata::jsonb->>'orderId' = $2
       ORDER BY created_at DESC LIMIT 1`,
      [session.user.userId, orderId]
    )

    if (!dbTx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const meta = typeof dbTx.metadata === 'string' ? JSON.parse(dbTx.metadata) : dbTx.metadata

    // Already completed: return existing credits without calling PayPal
    if (meta?.status === 'completed') {
      const user = await getOne(`SELECT credits FROM users WHERE id = $1`, [session.user.userId])
      return NextResponse.json({ success: true, credits: user?.credits, tokens: meta.tokens })
    }

    const tokenAmount = Number(meta?.tokens)
    const expectedPrice = meta?.price
    if (!Number.isSafeInteger(tokenAmount) || tokenAmount <= 0 || tokenAmount > 10_000_000) {
      return NextResponse.json({ error: 'Invalid transaction amount' }, { status: 400 })
    }

    // ── Step 2: PayPal capture with timeout and idempotency ──
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'PayPal is temporarily unavailable' }, { status: 503 })
    }

    const { accessToken, baseUrl: paypalBaseUrl } = await getPayPalAccess()

    // Stable idempotency key: same orderId always maps to same PayPal-Request-Id,
    // so retries after network failures hit PayPal's idempotency cache.
    const requestId = `capture-${orderId}`

    const ppRes = await abortableFetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'PayPal-Request-Id': requestId,
      },
    }, PAYPAL_TIMEOUT_MS)

    if (!ppRes.ok) {
      const err = await ppRes.text()
      console.error('[paypal capture-order error]', err)
      return NextResponse.json({ error: 'PayPal capture failed' }, { status: 502 })
    }

    const order = await ppRes.json()
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: `Order status: ${order.status}` }, { status: 400 })
    }

    // ── Step 3: Verify the captured amount matches the expected purchase ──
    const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
    if (!capture) {
      return NextResponse.json({ error: 'Invalid capture response' }, { status: 502 })
    }

    // Only credit when funds have actually settled.
    // PENDING / DECLINED / FAILED must not add credits.
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: `Payment not settled: ${capture.status}` }, { status: 400 })
    }

    const capturedAmount = capture.amount?.value
    const capturedCurrency = capture.amount?.currency_code
    if (capturedCurrency !== 'USD' || capturedAmount !== expectedPrice) {
      console.error(`[paypal capture-order] Amount mismatch: expected ${expectedPrice} USD, got ${capturedAmount} ${capturedCurrency}`)
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    // ── Step 4: Update local transaction and credit the user ──
    const completed = await prisma.$transaction(async (tx) => {
      const rows: any[] = await tx.$queryRawUnsafe(
        `UPDATE transactions
         SET description = $1, metadata = $2::jsonb
         WHERE id = $3
           AND user_id = $4
           AND metadata::jsonb->>'status' = 'pending'
         RETURNING id`,
        `Purchased ${tokenAmount.toLocaleString()} credits via PayPal`,
        JSON.stringify({
          ...meta,
          tokens: tokenAmount,
          status: 'completed',
          paypalOrderId: order.id,
          paypalCaptureId: capture.id,
          capturedAt: new Date().toISOString(),
        }),
        dbTx.id,
        session.user.userId
      )

      if (!rows.length) return false

      await tx.$executeRawUnsafe(
        `UPDATE users SET credits = credits + $1 WHERE id = $2`,
        tokenAmount,
        session.user.userId
      )

      return true
    })

    if (!completed) {
      return NextResponse.json({ error: 'Already fulfilled' }, { status: 400 })
    }

    const user = await getOne(`SELECT credits FROM users WHERE id = $1`, [session.user.userId])

    return NextResponse.json({ success: true, credits: user?.credits, tokens: tokenAmount })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[paypal capture-order] PayPal request timed out')
      return NextResponse.json({ error: 'PayPal request timed out' }, { status: 504 })
    }
    if (err instanceof PayPalAuthError) {
      console.error('[paypal capture-order]', err.message)
      return NextResponse.json({ error: 'PayPal service temporarily unavailable' }, { status: err.status })
    }
    console.error('[paypal capture-order]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
