import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { execute, getOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || 'sandbox'

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 })
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const endpoint = mode === 'live'
      ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`
      : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`

    const ppRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${authHeader}` },
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

    // Credit the user
    await execute(
      `UPDATE users SET credits = credits + $1 WHERE id = $2`,
      [meta.tokens, session.user.userId]
    )

    // Update transaction to completed
    await execute(
      `UPDATE transactions SET description = $1, metadata = $2 WHERE id = $3`,
      [
        `Purchased ${meta.tokens.toLocaleString()} credits via PayPal`,
        JSON.stringify({ ...meta, status: 'completed', paypalOrderId: order.id, capturedAt: new Date().toISOString() }),
        pendingTx.id,
      ]
    )

    const user = await getOne(`SELECT credits FROM users WHERE id = $1`, [session.user.userId])

    return NextResponse.json({ success: true, credits: user?.credits, tokens: meta.tokens })
  } catch (err) {
    console.error('[paypal capture-order]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}