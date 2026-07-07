import { NextRequest, NextResponse } from 'next/server'
import { execute, getOne } from '@/lib/db'
import Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 *
 * Stripe Dashboard → Developers → Webhooks → Add endpoint:
 * URL: https://llmrpc.com/api/stripe/webhook
 * Events:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 *
 * Get webhook signing secret from:
 * Stripe Dashboard → Developers → Webhooks → [site] → Signing secret
 */
export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey)
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const isProduction = process.env.NODE_ENV === 'production'

  let event: Stripe.Event

  try {
    const body = await req.text()
    if (sig && webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      if (isProduction) {
        return NextResponse.json({ error: 'Webhook signature verification required' }, { status: 400 })
      }
      // Dev mode: skip verification
      event = JSON.parse(body)
      console.log('[stripe webhook] Dev mode - skipping signature verification')
    }
  } catch (err: any) {
    console.error('[stripe webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[stripe webhook] ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (!userId || !plan) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const stripeSubId = subscription.id
        const stripeCustomerId = session.customer as string

        // Upsert subscription record
        const existing = await getOne('SELECT * FROM subscriptions WHERE stripe_sub_id = $1', [stripeSubId])
        if (!existing) {
          await execute(
            `INSERT INTO subscriptions (user_id, plan, status, stripe_sub_id, stripe_customer_id, current_period_start, current_period_end)
             VALUES ($1, $2, 'ACTIVE', $3, $4, to_timestamp($5), to_timestamp($6))`,
            [
              userId,
              plan.toUpperCase(),
              stripeSubId,
              stripeCustomerId,
              subscription.current_period_start,
              subscription.current_period_end,
            ]
          )
        }

        // Create transaction record
        await execute(
          `INSERT INTO transactions (user_id, type, amount, description, metadata)
           VALUES ($1, 'SUBSCRIPTION', 0, $2, $3)`,
          [
            userId,
            `Subscribed to ${plan} plan`,
            JSON.stringify({ stripeSubId, plan, event: 'checkout.session.completed' }),
          ]
        )

        console.log(`[stripe webhook] Subscription created: user=${userId} plan=${plan}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        const plan = sub.metadata?.plan

        if (!userId) break

        const statusMap: Record<string, string> = {
          active: 'ACTIVE',
          trialing: 'ACTIVE',
          past_due: 'PAST_DUE',
          canceled: 'CANCELLED',
          incomplete: 'INCOMPLETE',
          unpaid: 'PAST_DUE',
        }
        const status = statusMap[sub.status] || 'ACTIVE'

        await execute(
          `UPDATE subscriptions SET status = $1, current_period_start = to_timestamp($2), current_period_end = to_timestamp($3)
           WHERE stripe_sub_id = $4`,
          [status, sub.current_period_start, sub.current_period_end, sub.id]
        )

        if (plan) {
          await execute(`UPDATE subscriptions SET plan = $1 WHERE stripe_sub_id = $2`, [plan.toUpperCase(), sub.id])
        }

        console.log(`[stripe webhook] Subscription updated: ${sub.id} status=${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await execute(
          `UPDATE subscriptions SET status = 'CANCELLED' WHERE stripe_sub_id = $1`,
          [sub.id]
        )
        console.log(`[stripe webhook] Subscription cancelled: ${sub.id}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const userId = (await getOne('SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1', [customerId]))?.user_id

        if (userId) {
          await execute(
            `INSERT INTO transactions (user_id, type, amount, description, metadata)
             VALUES ($1, 'SUBSCRIPTION', 0, $2, $3)`,
            [userId, `Monthly renewal`, JSON.stringify({ invoiceId: invoice.id })]
          )
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string

        if (subId) {
          await execute(
            `UPDATE subscriptions SET status = 'PAST_DUE' WHERE stripe_sub_id = $1`,
            [subId]
          )
        }
        console.log(`[stripe webhook] Payment failed for subscription ${subId}`)
        break
      }

      default:
        console.log(`[stripe webhook] Unhandled: ${event.type}`)
    }
  } catch (err) {
    console.error(`[stripe webhook] Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
