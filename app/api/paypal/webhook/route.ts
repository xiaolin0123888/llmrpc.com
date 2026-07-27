import { NextRequest, NextResponse } from "next/server"
import { getOne, prisma } from "@/lib/db"
import { verifyPaypalWebhookSignature } from "@/lib/paypal"
import { renewPeriodIfNeeded } from "@/lib/period"

interface PayPalWebhookEvent {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    status?: string
    plan_id?: string
    custom_id?: string
    subscriber?: { payer_id?: string }
    billing_agreement_id?: string
    billing_info?: {
      last_payment?: { amount?: { total?: string; currency?: string; value?: string; currency_code?: string } }
      next_billing_time?: string
    }
    amount?: { total?: string; currency?: string; value?: string; currency_code?: string }
    supplementary_data?: {
      related_ids?: { order_id?: string }
    }
  }
}

const CREDIT_EVENT_TYPES = ["PAYMENT.CAPTURE.COMPLETED"]
const SUBSCRIPTION_EVENT_TYPES = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "PAYMENT.SALE.COMPLETED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
]
const HANDLED_EVENT_TYPES = [...CREDIT_EVENT_TYPES, ...SUBSCRIPTION_EVENT_TYPES]

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && (
    err.message.includes("fetch") ||
    err.message.includes("network") ||
    err.message.includes("ENOTFOUND") ||
    err.message.includes("ECONNREFUSED") ||
    err.message.includes("ETIMEDOUT") ||
    err.message.includes("certificate") ||
    err.message.includes("TLS") ||
    err.cause !== undefined
  )
}

export async function POST(req: NextRequest) {
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 })
  }

  let body: PayPalWebhookEvent
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.event_type) {
    return NextResponse.json({ error: "Missing event_type" }, { status: 400 })
  }

  const eventType = body.event_type
  const webhookEventId = body.id || "unknown"
  console.log(`[paypal webhook] Received ${eventType} (id: ${webhookEventId})`)

  const verified = await verifyPaypalWebhookSignature(rawBody, {
    "paypal-auth-algo": req.headers.get("paypal-auth-algo"),
    "paypal-cert-url": req.headers.get("paypal-cert-url"),
    "paypal-transmission-id": req.headers.get("paypal-transmission-id"),
    "paypal-transmission-sig": req.headers.get("paypal-transmission-sig"),
    "paypal-transmission-time": req.headers.get("paypal-transmission-time"),
  })

  if (!verified) {
    console.error(`[paypal webhook] Signature verification FAILED for ${eventType}`)
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 })
  }

  console.log(`[paypal webhook] Signature verified OK for ${eventType}`)

  if (!HANDLED_EVENT_TYPES.includes(eventType)) {
    console.log(`[paypal webhook] Ignoring event type: ${eventType}`)
    return NextResponse.json({ received: true, processed: false, reason: "event_type_not_handled" })
  }

  // ── Subscription events ──
  if (SUBSCRIPTION_EVENT_TYPES.includes(eventType)) {
    return handleSubscriptionEvent(body)
  }

  // ── One-time credit purchase events ──
  return handleCreditEvent(body)
}

async function handleSubscriptionEvent(body: PayPalWebhookEvent) {
  const resource = body.resource!
  const eventType = body.event_type!

  // For PAYMENT.SALE.COMPLETED, resource.id is the SALE id (not subscription).
  // billing_agreement_id links to the subscription. Handle in the event-specific block.
  // For BILLING.SUBSCRIPTION.* events, resource.id IS the subscription id.
  const isSaleEvent = eventType === "PAYMENT.SALE.COMPLETED"
  const paypalSubId = isSaleEvent
    ? (resource as any)?.billing_agreement_id
    : resource?.id

  if (!paypalSubId) {
    return NextResponse.json({ error: "Missing subscription identifier" }, { status: 400 })
  }

  // Find local subscription by PayPal subscription ID
  const sub = await getOne(
    `SELECT * FROM subscriptions WHERE paypal_sub_id = $1`,
    [paypalSubId]
  )

  if (!sub) {
    console.error(`[paypal webhook] No local subscription for ${paypalSubId}`)
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
    // Parse custom_id to get userId for verification
    let customUserId: string | undefined
    try {
      if (resource.custom_id) {
        customUserId = JSON.parse(resource.custom_id).userId
      }
    } catch {}

    if (sub.status === "ACTIVE") {
      console.log(`[paypal webhook] Subscription ${paypalSubId} already active`)
      return NextResponse.json({ received: true, processed: false, reason: "already_active" })
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `UPDATE subscriptions
         SET status = 'ACTIVE',
             current_period_start = NOW(),
             current_period_end = NOW() + INTERVAL '1 month'
         WHERE id = $1 AND paypal_sub_id = $2`,
        sub.id, paypalSubId
      )

      // Record activation transaction
      await tx.$executeRawUnsafe(
        `INSERT INTO transactions (user_id, type, amount, description, metadata)
         VALUES ($1, 'SUBSCRIPTION', 0, $2, $3::jsonb)`,
        sub.user_id,
        `Subscription activated: ${sub.plan}`,
        JSON.stringify({
          event: "subscription_activated",
          paypalSubId,
          plan: sub.plan,
          activatedAt: new Date().toISOString(),
        })
      )
    })

    console.log(`[paypal webhook] Subscription ${paypalSubId} activated for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "activated" })
  }

  if (eventType === "PAYMENT.SALE.COMPLETED") {
    // PAYMENT.SALE.COMPLETED — resource.id is the SALE id, NOT the subscription id.
    // The billing_agreement_id links the sale to the subscription.
    // PayPal Sale fields: amount.total + amount.currency (not value/currency_code).
    const saleId = resource.id!
    const billingAgreementId: string | undefined = (resource as any)?.billing_agreement_id

    if (!billingAgreementId) {
      // This sale may be a one-time purchase, not a subscription payment.
      // Route to credit handler instead.
      return handleCreditEvent(body)
    }

    // Find local subscription by billing_agreement_id (the PayPal subscription ID)
    const sub = await getOne(
      `SELECT * FROM subscriptions WHERE paypal_sub_id = $1`,
      [billingAgreementId]
    )
    if (!sub) {
      console.error(`[paypal webhook] No local subscription for billing agreement ${billingAgreementId}`)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Dedup: check if this sale was already processed
    const existing: any = await getOne(
      `SELECT id FROM transactions
       WHERE type = 'SUBSCRIPTION'
         AND metadata::jsonb->>'saleId' = $1
       LIMIT 1`,
      [saleId]
    )
    if (existing) {
      console.log(`[paypal webhook] Sale ${saleId} already processed, skipping`)
      return NextResponse.json({ received: true, processed: false, reason: "duplicate_sale" })
    }

    const paidAmount = resource.amount?.total
    const paidCurrency = resource.amount?.currency

    if (paidCurrency && paidCurrency !== "USD") {
      console.error(`[paypal webhook] Unexpected subscription currency: ${paidCurrency}`)
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `UPDATE subscriptions
         SET current_period_end = current_period_end + INTERVAL '1 month',
             status = 'ACTIVE'
         WHERE id = $1 AND paypal_sub_id = $2`,
        sub.id, billingAgreementId
      )

      await tx.$executeRawUnsafe(
        `INSERT INTO transactions (user_id, type, amount, description, metadata)
         VALUES ($1, 'SUBSCRIPTION', 0, $2, $3::jsonb)`,
        sub.user_id,
        `Subscription renewed: ${sub.plan} (${paidAmount || "unknown"} USD)`,
        JSON.stringify({
          event: "subscription_renewed",
          saleId,
          paypalSubId: billingAgreementId,
          plan: sub.plan,
          amount: paidAmount,
          renewedAt: new Date().toISOString(),
        })
      )
    })

    console.log(`[paypal webhook] Subscription ${billingAgreementId} renewed (sale ${saleId}) for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "renewed" })
  }

  if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
    await prisma.$executeRawUnsafe(
      `UPDATE subscriptions SET status = 'CANCELLED' WHERE id = $1 AND paypal_sub_id = $2`,
      sub.id, paypalSubId
    )
    console.log(`[paypal webhook] Subscription ${paypalSubId} cancelled for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "cancelled" })
  }

  if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
    await prisma.$executeRawUnsafe(
      `UPDATE subscriptions SET status = 'SUSPENDED' WHERE id = $1 AND paypal_sub_id = $2`,
      sub.id, paypalSubId
    )
    console.log(`[paypal webhook] Subscription ${paypalSubId} suspended for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "suspended" })
  }

  if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
    await prisma.$executeRawUnsafe(
      `UPDATE subscriptions SET status = 'EXPIRED' WHERE id = $1 AND paypal_sub_id = $2`,
      sub.id, paypalSubId
    )
    console.log(`[paypal webhook] Subscription ${paypalSubId} expired for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "expired" })
  }

  if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
    // Don't cancel immediately — just log. PayPal will retry and eventually cancel.
    console.error(`[paypal webhook] Subscription ${paypalSubId} payment failed for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "payment_failed_logged" })
  }

  return NextResponse.json({ received: true, processed: false, reason: "unknown_sub_event" })
}

async function handleCreditEvent(body: PayPalWebhookEvent) {
  const resource = body.resource!
  if (!resource) {
    return NextResponse.json({ error: "Missing resource" }, { status: 400 })
  }

  const captureId = resource.id
  const captureStatus = resource.status
  const capturedAmount = resource.amount?.value
  const capturedCurrency = resource.amount?.currency_code

  if (!captureId || !capturedAmount || !capturedCurrency) {
    console.error("[paypal webhook] Missing capture details", { captureId, capturedAmount, capturedCurrency })
    return NextResponse.json({ error: "Incomplete capture data" }, { status: 400 })
  }

  if (captureStatus !== "COMPLETED") {
    console.log(`[paypal webhook] Capture ${captureId} status is ${captureStatus}, not crediting`)
    return NextResponse.json({ received: true, processed: false, reason: `capture_status_${captureStatus}` })
  }

  if (capturedCurrency !== "USD") {
    console.error(`[paypal webhook] Unexpected currency: ${capturedCurrency}`)
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
  }

  const paypalOrderId: string | null =
    resource.supplementary_data?.related_ids?.order_id || null

  let localTx: any = null

  if (paypalOrderId) {
    localTx = await getOne(
      `SELECT * FROM transactions
       WHERE type = 'PURCHASE'
         AND metadata::jsonb->>'orderId' = $1
       ORDER BY created_at DESC LIMIT 1`,
      [paypalOrderId]
    )
  }

  if (!localTx) {
    localTx = await getOne(
      `SELECT * FROM transactions
       WHERE type = 'PURCHASE'
         AND metadata::jsonb->>'paypalCaptureId' = $1
       ORDER BY created_at DESC LIMIT 1`,
      [captureId]
    )
  }

  if (!localTx) {
    console.error("[paypal webhook] No local transaction found")
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  const meta =
    typeof localTx.metadata === "string"
      ? JSON.parse(localTx.metadata)
      : localTx.metadata

  if (meta?.status === "completed") {
    console.log(`[paypal webhook] Order already credited, skipping`)
    return NextResponse.json({ received: true, processed: false, reason: "already_credited" })
  }

  const userId: string = localTx.user_id
  const tokenAmount = Number(meta?.tokens)
  const expectedPrice = meta?.price

  if (!Number.isSafeInteger(tokenAmount) || tokenAmount <= 0 || tokenAmount > 10_000_000) {
    console.error("[paypal webhook] Invalid token amount", meta?.tokens)
    return NextResponse.json({ error: "Invalid token amount" }, { status: 400 })
  }

  if (!expectedPrice || capturedAmount !== expectedPrice) {
    console.error(`[paypal webhook] Amount mismatch: expected ${expectedPrice} USD, got ${capturedAmount} USD`)
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
  }

  const credited = await prisma.$transaction(async (tx) => {
    const txRows: any[] = await tx.$queryRawUnsafe(
      `UPDATE transactions
       SET description = $1, metadata = $2::jsonb
       WHERE id = $3 AND user_id = $4
         AND metadata::jsonb->>'status' = 'pending'
       RETURNING id`,
      `Purchased ${tokenAmount.toLocaleString()} credits via PayPal (webhook)`,
      JSON.stringify({
        ...meta,
        status: "completed",
        paypalCaptureId: captureId,
        paypalOrderId: paypalOrderId || meta?.orderId,
        capturedAt: new Date().toISOString(),
        creditedVia: "webhook",
      }),
      localTx.id,
      userId
    )

    if (!txRows.length) {
      console.log(`[paypal webhook] Tx ${localTx.id} no longer pending, skipping`)
      return null
    }

    await tx.$executeRawUnsafe(
      `UPDATE users SET credits = credits + $1 WHERE id = $2`,
      tokenAmount,
      userId
    )

    return txRows[0]
  })

  if (!credited) {
    return NextResponse.json({ received: true, processed: false, reason: "already_fulfilled" })
  }

  console.log(`[paypal webhook] Credited ${tokenAmount} tokens to user ${userId}`)
  return NextResponse.json({ received: true, processed: true, tokens: tokenAmount })
}
