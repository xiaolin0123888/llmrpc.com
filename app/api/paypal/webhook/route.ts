import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Verify PayPal webhook signature
 * Reference: https://developer.paypal.com/api/rest/webhooks/
 */
async function verifyPayPalSignature(
  headers: Headers,
  body: string,
): Promise<{ valid: boolean; verificationStatus: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  if (!clientId || !clientSecret) {
    console.warn('[paypal webhook] PayPal not configured')
    return { valid: false, verificationStatus: 'NOT_CONFIGURED' }
  }

  const authAlgo = headers.get('paypal-auth-algo')
  const certUrl = headers.get('paypal-cert-url')
  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionSig = headers.get('paypal-transmission-sig')
  const transmissionTime = headers.get('paypal-transmission-time')

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    console.warn('[paypal webhook] Missing signature headers')
    return { valid: false, verificationStatus: 'MISSING_HEADERS' }
  }

  if (!certUrl.includes('.paypal.com') && !certUrl.includes('.paypal.cn')) {
    console.warn(`[paypal webhook] Suspicious cert URL: ${certUrl}`)
    return { valid: false, verificationStatus: 'INVALID_CERT_URL' }
  }

  if (!webhookId) {
    console.warn('[paypal webhook] ⚠️  PAYPAL_WEBHOOK_ID not set — accepting event with limited validation.')
    return { valid: true, verificationStatus: 'WEBHOOK_ID_NOT_SET' }
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const endpoint = mode === 'live'
      ? 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature'
      : 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature'

    const verifyBody = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(verifyBody),
    })

    if (!res.ok) {
      console.error('[paypal webhook] Signature verification request failed')
      return { valid: false, verificationStatus: 'API_ERROR' }
    }

    const result = await res.json()
    return {
      valid: result.verification_status === 'SUCCESS',
      verificationStatus: result.verification_status || 'UNKNOWN',
    }
  } catch (err) {
    console.error('[paypal webhook] Signature verification error', err)
    return { valid: false, verificationStatus: 'ERROR' }
  }
}

/**
 * Find user by a subscription ID (PayPal subscription ID stored in metadata).
 */
async function findUserByPayPalSubscriptionId(subscriptionId: string): Promise<string | null> {
  const sub = await prisma.subscription.findFirst({
    where: {
      metadata: { path: ['paypalSubscriptionId'], equals: subscriptionId },
    },
    select: { userId: true },
  })
  return sub?.userId || null
}

/**
 * Atomically fulfill a one-time purchase.
 */
async function atomicFulfill(orderId: string): Promise<{ fulfilled: boolean; userId?: string; tokens?: number }> {
  const tx = await prisma.transaction.findFirst({
    where: {
      type: 'PURCHASE',
      metadata: { path: ['orderId'], equals: orderId },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!tx) return { fulfilled: false }

  const meta = tx.metadata as any
  if (meta?.status === 'completed') return { fulfilled: false }

  const updated = await prisma.transaction.updateMany({
    where: {
      id: tx.id,
      type: 'PURCHASE',
      metadata: { path: ['status'], not: 'completed' },
    },
    data: {
      metadata: {
        ...meta,
        status: 'completed',
        fulfilledAt: new Date().toISOString(),
      },
    },
  })

  if (updated.count === 0) return { fulfilled: false }

  await prisma.user.update({
    where: { id: tx.userId },
    data: { credits: { increment: meta.tokens || 0 } },
  })

  return { fulfilled: true, userId: tx.userId, tokens: meta.tokens }
}

/**
 * Handle subscription payment success (PAYMENT.SALE.COMPLETED).
 * This fires when PayPal successfully charges a subscription billing cycle.
 */
async function handleSubscriptionPaymentCompleted(resource: any, webhookEventId: string): Promise<void> {
  const subscriptionId = resource?.billing_agreement_id
  const amount = resource?.amount?.total
  const currency = resource?.amount?.currency

  if (!subscriptionId) {
    console.log('[paypal webhook] PAYMENT.SALE.COMPLETED without billing_agreement_id — ignoring')
    return
  }

  const userId = await findUserByPayPalSubscriptionId(subscriptionId)
  if (!userId) {
    console.log(`[paypal webhook] No user found for PayPal subscription ${subscriptionId}`)
    return
  }

  // Deduplicate
  const existing = await prisma.transaction.findFirst({
    where: {
      userId,
      type: 'SUBSCRIPTION_PAYMENT',
      metadata: { path: ['webhookEventId'], equals: webhookEventId },
    },
  })
  if (existing) {
    console.log(`[paypal webhook] Duplicate subscription payment ${webhookEventId} — ignored`)
    return
  }

  // Record the payment
  await prisma.transaction.create({
    data: {
      userId,
      type: 'SUBSCRIPTION_PAYMENT',
      amount: 0,
      description: `PayPal subscription payment: ${amount} ${currency}`,
      metadata: {
        webhookEventId,
        paypalSubscriptionId: subscriptionId,
        amount,
        currency,
        saleId: resource?.id,
        timestamp: new Date().toISOString(),
      },
    },
  })

  // Extend the subscription period (payment verified)
  const now = new Date()
  const newPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  await prisma.subscription.updateMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PAST_DUE'] },
    },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: newPeriodEnd.toISOString(),
    },
  })

  console.log(`[paypal webhook] ✅ Subscription payment for user ${userId}: ${amount} ${currency}`)
}

/**
 * Handle subscription status changes.
 */
async function handleSubscriptionStatusChange(
  eventType: string,
  resource: any,
  webhookEventId: string,
): Promise<void> {
  const subscriptionId = resource?.id
  if (!subscriptionId) return

  const userId = await findUserByPayPalSubscriptionId(subscriptionId)
  if (!userId) {
    console.log(`[paypal webhook] No user found for PayPal subscription ${subscriptionId}`)
    return
  }

  // Deduplicate
  const existing = await prisma.transaction.findFirst({
    where: {
      userId,
      type: 'SUBSCRIPTION_EVENT',
      metadata: { path: ['webhookEventId'], equals: webhookEventId },
    },
  })
  if (existing) return

  let newStatus: 'CANCELLED' | 'SUSPENDED' | 'EXPIRED' | 'PAST_DUE'
  let description: string

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      newStatus = 'CANCELLED'
      description = 'PayPal subscription cancelled'
      break
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      newStatus = 'SUSPENDED'
      description = 'PayPal subscription suspended (payment issue)'
      break
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      newStatus = 'EXPIRED'
      description = 'PayPal subscription expired'
      break
    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
      // Don't cancel immediately — mark as PAST_DUE for grace period
      newStatus = 'PAST_DUE'
      description = 'PayPal subscription payment failed'
      break
    default:
      return
  }

  // Record the event
  await prisma.transaction.create({
    data: {
      userId,
      type: 'SUBSCRIPTION_EVENT',
      amount: 0,
      description,
      metadata: {
        webhookEventId,
        eventType,
        paypalSubscriptionId: subscriptionId,
        newStatus,
        timestamp: new Date().toISOString(),
      },
    },
  })

  // Update subscription status
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PAST_DUE', 'CANCELLING'] },
    },
    data: { status: newStatus },
  })

  console.log(`[paypal webhook] Subscription ${eventType}: user ${userId} → ${newStatus}`)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headers = req.headers

    // ── Step 1: Verify webhook signature ──
    const { valid, verificationStatus } = await verifyPayPalSignature(headers, body)

    if (!valid) {
      console.error(`[paypal webhook] Signature verification failed: ${verificationStatus}`)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // ── Step 2: Process the verified event ──
    const event = JSON.parse(body)
    const { event_type, resource, id: webhookEventId } = event

    console.log(`[paypal webhook] ✅ Verified ${event_type} (id: ${webhookEventId})`)

    switch (event_type) {
      // ── One-time purchase events ──
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId =
          resource?.supplementary_data?.related_ids?.order_id ||
          resource?.order_id ||
          resource?.id

        if (orderId) {
          // Tag webhook event ID for dedup
          await prisma.transaction.updateMany({
            where: {
              type: 'PURCHASE',
              metadata: { path: ['orderId'], equals: orderId },
            },
            data: { metadata: { webhookEventId } },
          })

          const result = await atomicFulfill(orderId)
          if (result.fulfilled) {
            console.log(`[paypal webhook] ✅ Fulfilled ${result.tokens} tokens for user ${result.userId}`)
          }
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = resource?.order_id || resource?.id
        if (orderId) {
          await prisma.transaction.updateMany({
            where: {
              type: 'PURCHASE',
              AND: [
                { metadata: { path: ['orderId'], equals: orderId } },
                { metadata: { path: ['status'], not: 'completed' } },
              ],
            },
            data: {
              metadata: {
                status: event_type === 'PAYMENT.CAPTURE.DENIED' ? 'denied' : 'refunded',
                webhookEventId,
              },
            },
          })
        }
        break
      }

      // ── Subscription payment events ──
      case 'PAYMENT.SALE.COMPLETED': {
        await handleSubscriptionPaymentCompleted(resource, webhookEventId)
        break
      }

      case 'PAYMENT.SALE.REFUNDED': {
        const subscriptionId = resource?.billing_agreement_id
        if (subscriptionId) {
          const userId = await findUserByPayPalSubscriptionId(subscriptionId)
          if (userId) {
            await prisma.transaction.create({
              data: {
                userId,
                type: 'SUBSCRIPTION_EVENT',
                amount: 0,
                description: `PayPal subscription payment refunded: ${resource?.amount?.total} ${resource?.amount?.currency}`,
                metadata: {
                  webhookEventId,
                  eventType: event_type,
                  paypalSubscriptionId: subscriptionId,
                  timestamp: new Date().toISOString(),
                },
              },
            })
            console.log(`[paypal webhook] Subscription payment refunded for user ${userId}`)
          }
        }
        break
      }

      // ── Subscription lifecycle events ──
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        await handleSubscriptionStatusChange(event_type, resource, webhookEventId)
        break
      }

      // ── Subscription activated / created ──
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.CREATED': {
        // Subscription created/activated — log it
        const subscriptionId = resource?.id
        if (subscriptionId) {
          const userId = await findUserByPayPalSubscriptionId(subscriptionId)
          if (userId) {
            await prisma.transaction.create({
              data: {
                userId,
                type: 'SUBSCRIPTION_EVENT',
                amount: 0,
                description: `PayPal subscription ${event_type.replace('BILLING.SUBSCRIPTION.', '').toLowerCase()}`,
                metadata: {
                  webhookEventId,
                  eventType: event_type,
                  paypalSubscriptionId: subscriptionId,
                  planId: resource?.plan_id,
                  timestamp: new Date().toISOString(),
                },
              },
            })
            console.log(`[paypal webhook] Subscription ${event_type} for user ${userId}`)
          }
        }
        break
      }

      default:
        console.log(`[paypal webhook] Unhandled event: ${event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[paypal webhook error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
