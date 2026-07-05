import { NextRequest, NextResponse } from 'next/server'
import { execute, getOne } from '@/lib/db'

/**
 * PayPal Webhook Handler
 *
 * Register at: https://developer.paypal.com/dashboard
 * Events: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED
 * Webhook URL: https://llmrpc.com/api/paypal/webhook
 *
 * This webhook can be used for:
 * - Auto-recharge (Reference Transactions) - trigger additional charges
 * - Idempotent reconciliation as backup to client-side capture
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, resource } = body

    console.log(`[paypal webhook] ${event_type}`)

    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = resource?.supplementary_data?.related_ids?.order_id || resource?.order_id || resource?.id
        if (!orderId) break

        const tx = await getOne(
          `SELECT * FROM transactions WHERE type = 'PURCHASE' AND metadata::jsonb->>'orderId' = $1 LIMIT 1`,
          [orderId]
        )

        if (tx) {
          const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata
          if (meta?.status !== 'completed') {
            await execute(`UPDATE users SET credits = credits + $1 WHERE id = $2`, [meta.tokens, tx.user_id])
            await execute(
              `UPDATE transactions SET metadata = $1 WHERE id = $2`,
              [JSON.stringify({ ...meta, status: 'completed', webhookFiredAt: new Date().toISOString() }), tx.id]
            )
          }
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = resource?.order_id || resource?.id
        if (orderId) {
          await execute(
            `UPDATE transactions SET metadata = jsonb_set(metadata, '{status}', '"denied"')
             WHERE type = 'PURCHASE' AND metadata::jsonb->>'orderId' = $1 AND metadata::jsonb->>'status' = 'pending'`,
            [orderId]
          )
        }
        break
      }

      default:
        console.log(`[paypal webhook] Unhandled: ${event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[paypal webhook error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}