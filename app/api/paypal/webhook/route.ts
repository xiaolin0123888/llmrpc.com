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

const CREDIT_EVENT_TYPES = ["PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.REFUNDED", "PAYMENT.CAPTURE.REVERSED"]
const SUBSCRIPTION_EVENT_TYPES = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.REFUNDED",
  "PAYMENT.SALE.REVERSED",
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
  const isSaleEvent = eventType === "PAYMENT.SALE.COMPLETED" || eventType === "PAYMENT.SALE.REFUNDED" || eventType === "PAYMENT.SALE.REVERSED"
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
    const saleId = resource.id!
    const billingAgreementId: string | undefined = (resource as any)?.billing_agreement_id

    if (!billingAgreementId) {
      return handleCreditEvent(body)
    }

    const sub = await getOne(
      `SELECT * FROM subscriptions WHERE paypal_sub_id = $1`,
      [billingAgreementId]
    )
    if (!sub) {
      console.error(`[paypal webhook] No local subscription for billing agreement ${billingAgreementId}`)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const paidAmount = resource.amount?.total
    const paidCurrency = resource.amount?.currency

    if (paidCurrency && paidCurrency !== "USD") {
      console.error(`[paypal webhook] Unexpected subscription currency: ${paidCurrency}`)
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    // Atomic: dedup insert + subscription extension in ONE transaction.
    // If dedup fails (ON CONFLICT), renewal is never committed.
    let isDuplicate = false
    try {
      const paymentMeta = JSON.stringify({
        event: "subscription_renewed",
        saleId,
        paypalSubId: billingAgreementId,
        plan: sub.plan,
        amount: paidAmount,
        renewedAt: new Date().toISOString(),
      })

      await prisma.$transaction(async (tx) => {
        // Step 1: Atomic dedup — fails on duplicate, rolls back whole tx
        const dedupRows: any[] = await tx.$queryRawUnsafe(
          `INSERT INTO paypal_processed_sales (sale_id) VALUES ($1)
           ON CONFLICT (sale_id) DO NOTHING
           RETURNING sale_id`,
          saleId
        )
        if (!dedupRows.length) {
          isDuplicate = true
          return  // skip rest of tx
        }

        // Step 2: Extend subscription period
        await tx.$executeRawUnsafe(
          `UPDATE subscriptions
           SET current_period_end = current_period_end + INTERVAL '1 month',
               status = 'ACTIVE'
           WHERE id = $1 AND paypal_sub_id = $2`,
          sub.id, billingAgreementId
        )

        // Step 3: Record transaction
        await tx.$executeRawUnsafe(
          `INSERT INTO transactions (user_id, type, amount, description, metadata)
           VALUES ($1, 'SUBSCRIPTION', 0, $2, $3::jsonb)`,
          sub.user_id,
          `Subscription renewed: ${sub.plan} (${paidAmount || "unknown"} USD)`,
          paymentMeta
        )
      })
    } catch (err: any) {
      console.error(`[paypal webhook] Renewal transaction failed:`, err?.message)
      return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }

    if (isDuplicate) {
      console.log(`[paypal webhook] Sale ${saleId} already processed (atomic dedup)`)
      return NextResponse.json({ received: true, processed: false, reason: "duplicate_sale" })
    }

    console.log(`[paypal webhook] Subscription ${billingAgreementId} renewed (sale ${saleId}) for user ${sub.user_id}`)
    return NextResponse.json({ received: true, processed: true, action: "renewed" })
  }

  if (eventType === "PAYMENT.SALE.REFUNDED" || eventType === "PAYMENT.SALE.REVERSED") {
    const saleId = resource.id!
    const billingAgreementId: string | undefined = (resource as any)?.billing_agreement_id
    if (!billingAgreementId) return NextResponse.json({ received: true, processed: false, reason: "no_billing_agreement" })

    // Atomic: lock subscription + renewal tx, check dedup, roll back period, mark refunded.
    // All in ONE transaction with FOR UPDATE to prevent concurrent/double refunds.
    try {
      await prisma.$transaction(async (tx) => {
        // Lock subscription row
        const subRows: any[] = await tx.$queryRawUnsafe(
          `SELECT * FROM subscriptions WHERE paypal_sub_id = $1 FOR UPDATE`,
          billingAgreementId
        )
        if (!subRows.length) {
          console.error(`[paypal webhook] Subscription ${billingAgreementId} not found for refund`)
          return
        }
        const sub = subRows[0]

        // Find the renewal transaction
        const renewalRows: any[] = await tx.$queryRawUnsafe(
          `SELECT id, metadata FROM transactions
           WHERE type = 'SUBSCRIPTION'
             AND metadata::jsonb->>'saleId' = $1
           ORDER BY created_at DESC LIMIT 1
           FOR UPDATE`,
          saleId
        )
        if (!renewalRows.length) {
          console.log(`[paypal webhook] No renewal found for refunded sale ${saleId}`)
          return
        }
        const renewalTx = renewalRows[0]

        // Dedup: check if already refunded
        const meta = typeof renewalTx.metadata === 'string' ? JSON.parse(renewalTx.metadata) : renewalTx.metadata
        if (meta?.refunded) {
          console.log(`[paypal webhook] Renewal tx ${renewalTx.id} already refunded, skipping`)
          return
        }

        // Roll back one month from period end
        await tx.$executeRawUnsafe(
          `UPDATE subscriptions
           SET current_period_end = current_period_end - INTERVAL '1 month'
           WHERE id = $1
             AND current_period_end > NOW()`,
          sub.id
        )

        // Mark the renewal transaction as refunded (parameterized, no string interpolation)
        const refundMeta = JSON.stringify({ refunded: true, refundedAt: new Date().toISOString() })
        await tx.$executeRawUnsafe(
          `UPDATE transactions
           SET metadata = metadata::jsonb || $1::jsonb
           WHERE id = $2`,
          refundMeta, renewalTx.id
        )

        console.log(`[paypal webhook] Refunded sale ${saleId}, rolled back subscription ${billingAgreementId}`)
      })

      return NextResponse.json({ received: true, processed: true, action: "refunded" })
    } catch (err: any) {
      console.error(`[paypal webhook] SALE refund tx failed:`, err?.message)
      return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
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

  if (captureStatus === "REFUNDED" || captureStatus === "REVERSED") {
    // Credit purchase refunded — atomic: revoke credits + mark refunded in one tx.
    // FOR UPDATE prevents concurrent refund processing.
    // If user spent credits, deduct remaining balance and record the shortfall.
    const refundedAt = new Date().toISOString()
    let action = "credits_revoked"

    await prisma.$transaction(async (tx) => {
      const txRows: any[] = await tx.$queryRawUnsafe(
        `SELECT * FROM transactions
         WHERE type = 'PURCHASE'
           AND (metadata::jsonb->>'paypalCaptureId' = $1
                OR metadata::jsonb->>'orderId' = $1)
           AND metadata::jsonb->>'status' = 'completed'
         ORDER BY created_at DESC LIMIT 1
         FOR UPDATE`,
        captureId
      )
      if (!txRows.length) {
        console.log(`[paypal webhook] No completed credit tx for refunded capture ${captureId}`)
        return
      }

      const creditedTx = txRows[0]
      const meta = typeof creditedTx.metadata === 'string' ? JSON.parse(creditedTx.metadata) : creditedTx.metadata
      const tokenAmount = Number(meta?.tokens) || 0
      if (tokenAmount <= 0) return

      // Lock user row and read current balance
      const userRows: any[] = await tx.$queryRawUnsafe(
        `SELECT credits FROM users WHERE id = $1 FOR UPDATE`,
        creditedTx.user_id
      )
      const currentBalance: number = userRows.length ? Number(userRows[0].credits) : 0

      const deducted = Math.min(tokenAmount, currentBalance)
      const shortfall = tokenAmount - deducted

      if (deducted > 0) {
        await tx.$executeRawUnsafe(
          `UPDATE users SET credits = credits - $1 WHERE id = $2`,
          deducted, creditedTx.user_id
        )
      }

      if (shortfall > 0) {
        action = "credits_partial_refunded"
        console.error(
          `[paypal webhook] Refund shortfall: user ${creditedTx.user_id} ` +
          `owed ${tokenAmount}, balance was ${currentBalance}, shortfall ${shortfall}`
        )
      }

      const refundMeta = JSON.stringify({
        status: shortfall > 0 ? "partial_refunded" : "refunded",
        refundedAt,
        deducted,
        shortfall,
        tokenAmount,
      })

      // Mark transaction as refunded (or partial)
      await tx.$executeRawUnsafe(
        `UPDATE transactions SET metadata = metadata::jsonb || $1::jsonb WHERE id = $2`,
        refundMeta, creditedTx.id
      )

      console.log(`[paypal webhook] Deducted ${deducted}/${tokenAmount} credits, shortfall ${shortfall}, user ${creditedTx.user_id}`)
    })

    return NextResponse.json({ received: true, processed: true, action })
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
