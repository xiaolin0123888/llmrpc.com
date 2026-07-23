import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, prisma } from '@/lib/db'
import { getPayPalAccess, isPayPalConfigured } from '@/lib/paypal'
import { safeJson } from '@/lib/safe-json'
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [body, parseError] = await safeJson<{ orderId?: string }>(req)
    if (parseError) return parseError

    const orderId = body?.orderId
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'PayPal is temporarily unavailable' }, { status: 503 })
    }

    const { accessToken, baseUrl: paypalBaseUrl } = await getPayPalAccess()

    // Stable idempotency key: same orderId always maps to same PayPal-Request-Id,
    // so retries after network failures hit PayPal's idempotency cache.
    const requestId = `capture-${orderId}`

    const ppRes = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'PayPal-Request-Id': requestId,
      },
    })

    if (!ppRes.ok) {
      const err = await ppRes.text()
      console.error('[paypal capture-order error]', err)
      return NextResponse.json({ error: 'PayPal capture failed' }, { status: 502 })
    }

    const order = await ppRes.json()
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: `Order status: ${order.status}` }, { status: 400 })
    }

    // Find pending transaction by orderId in metadata JSON
    const pendingTx = await getOne(
      `SELECT * FROM transactions
       WHERE user_id = $1 AND type = 'PURCHASE' AND metadata::jsonb->>'orderId' = $2 AND metadata::jsonb->>'status' = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [session.user.userId, orderId]
    )

    if (!pendingTx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const meta = typeof pendingTx.metadata === 'string' ? JSON.parse(pendingTx.metadata) : pendingTx.metadata
    if (meta?.status === 'completed') {
      return NextResponse.json({ error: 'Already fulfilled' }, { status: 400 })
    }

    const tokenAmount = Number(meta?.tokens)
    if (!Number.isSafeInteger(tokenAmount) || tokenAmount <= 0 || tokenAmount > 10_000_000) {
      return NextResponse.json({ error: 'Invalid transaction amount' }, { status: 400 })
    }

    const completed = await prisma.$transaction(async (tx) => {
      const rows: any[] = await tx.$queryRawUnsafe(
        `UPDATE transactions
         SET description = $1, metadata = $2::jsonb
         WHERE id = $3
           AND user_id = $4
           AND metadata::jsonb->>'status' = 'pending'
         RETURNING id`,
        `Purchased ${tokenAmount.toLocaleString()} credits via PayPal`,
        JSON.stringify({ ...meta, tokens: tokenAmount, status: 'completed', paypalOrderId: order.id, capturedAt: new Date().toISOString() }),
        pendingTx.id,
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
  } catch (err) {
    console.error('[paypal capture-order]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
