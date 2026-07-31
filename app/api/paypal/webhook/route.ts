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
    seller_receivable_breakdown?: {
      total_refunded_amount?: { value?: string; currency_code?: string }
    }
    seller_payable_breakdown?: {
      total_refunded_amount?: { value?: string; currency_code?: string }
    }
    links?: Array<{ rel?: string; href?: string; method?: string }>
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
      // Activation: only set status and period_start.
      // period_end was already set at creation time (first paid period).
      // Do NOT extend here — the first SALE.COMPLETED will follow shortly
      // and that's the one that pays for this period.
      await tx.$executeRawUnsafe(
        `UPDATE subscriptions
         SET status = 'ACTIVE',
             current_period_start = NOW()
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

        // Step 2: Re-read subscription WITH lock to get billing_cycles_completed
        // Use billing_cycles_completed (not status) to distinguish first payment
        // from renewals. ACTIVATED can set status to ACTIVE before the first
        // SALE.COMPLETED arrives, making status-based checks unreliable.
        const lockedSubRows: any[] = await tx.$queryRawUnsafe(
          `SELECT billing_cycles_completed FROM subscriptions WHERE id = $1 FOR UPDATE`,
          sub.id
        )
        const billingCycles: number = lockedSubRows.length ? Number(lockedSubRows[0].billing_cycles_completed) : 0

        // Step 3: Extend period ONLY for renewals (billing cycles > 0).
        // billing_cycles_completed === 0: first payment, period already set at creation —
        //   just set ACTIVE and mark first cycle processed.
        // billing_cycles_completed > 0: renewal — extend period_end by one month.
        if (billingCycles > 0) {
          await tx.$executeRawUnsafe(
            `UPDATE subscriptions
             SET current_period_end = current_period_end + INTERVAL '1 month',
                 billing_cycles_completed = billing_cycles_completed + 1
             WHERE id = $1 AND paypal_sub_id = $2`,
            sub.id, billingAgreementId
          )
        } else {
          // First payment — set ACTIVE and mark first cycle processed
          await tx.$executeRawUnsafe(
            `UPDATE subscriptions
             SET status = 'ACTIVE',
                 billing_cycles_completed = 1
             WHERE id = $1 AND paypal_sub_id = $2`,
            sub.id, billingAgreementId
          )
        }

        // Step 4: Record transaction
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

/**
 * Handle credit refund notifications (PAYMENT.CAPTURE.REFUNDED / REVERSED).
 *
 * Cumulative refund amount comes from seller_payable_breakdown (Refund
 * resource) or seller_receivable_breakdown (Capture resource). Using this
 * single source of truth eliminates repeat-deduction risk: if PayPal
 * re-delivers the same notification, the breakdown is unchanged → delta = 0.
 *
 * For Refund resources the capture ID is extracted from links[rel=up].
 */
async function handleCreditRefund(body: PayPalWebhookEvent) {
  const resource = body.resource!

  const resourceStatus = resource.status
  const isCaptureResource =
    resourceStatus === "REFUNDED" ||
    resourceStatus === "PARTIALLY_REFUNDED" ||
    resourceStatus === "REVERSED"
  const isRefundResource = resourceStatus === "COMPLETED"

  // Extract capture ID from either resource type
  let captureId: string | undefined
  if (isCaptureResource) {
    captureId = resource.id
  } else if (isRefundResource) {
    const upLink = resource.links?.find(l => l.rel === "up")
    if (upLink?.href) {
      captureId = upLink.href.split("/").pop()
    }
  }

  if (!captureId) {
    console.error(`[paypal webhook] Cannot determine capture ID for refund event ${body.id}`)
    return NextResponse.json({ error: "Cannot determine capture ID" }, { status: 400 })
  }

  const refundedAt = new Date().toISOString()
  let processed = false
  let action = "credits_revoked"

  try {
    await prisma.$transaction(async (tx) => {
      const txRows: any[] = await tx.$queryRawUnsafe(
        `SELECT * FROM transactions
         WHERE type = 'PURCHASE'
           AND (metadata::jsonb->>'paypalCaptureId' = $1
                OR metadata::jsonb->>'orderId' = $1)
         ORDER BY created_at DESC LIMIT 1
         FOR UPDATE`,
        captureId
      )
      if (!txRows.length) {
        console.log(`[paypal webhook] No purchase tx for capture ${captureId} — will retry`)
        return
      }

      const creditedTx = txRows[0]
      const meta = typeof creditedTx.metadata === 'string'
        ? JSON.parse(creditedTx.metadata)
        : creditedTx.metadata

      if (meta?.status !== 'completed') {
        console.log(`[paypal webhook] Tx ${creditedTx.id} not completed (status=${meta?.status}), skipping`)
        processed = true
        return
      }

      const tokenAmount = Number(meta?.tokens) || 0
      if (tokenAmount <= 0) {
        console.log(`[paypal webhook] Tx ${creditedTx.id} tokenAmount=${tokenAmount}, skipping`)
        processed = true
        return
      }

      const originalPrice = parseFloat(meta?.price || "0")
      const prevCumulative = Number(meta?.cumulativeRefundTokens || 0)

      // Both Capture and Refund resources expose the cumulative refund via
      // total_refunded_amount, but on different parent objects:
      //   Capture → seller_receivable_breakdown
      //   Refund  → seller_payable_breakdown
      // Try payable first (Refund resource), fall back to receivable (Capture).
      let cumulativeRefundTokens: number
      let cumulativeRefundUsd: number

      const breakdownUsd =
        resource.seller_payable_breakdown?.total_refunded_amount?.value ||
        resource.seller_receivable_breakdown?.total_refunded_amount?.value
      if (breakdownUsd) {
        cumulativeRefundUsd = parseFloat(breakdownUsd)
        cumulativeRefundTokens = originalPrice > 0
          ? Math.round(tokenAmount * cumulativeRefundUsd / originalPrice)
          : 0
        const resourceLabel = isCaptureResource ? "Capture" : "Refund"
        console.log(
          `[paypal webhook] ${resourceLabel} refund: totalRefunded=$${cumulativeRefundUsd.toFixed(2)} ` +
          `→ ${cumulativeRefundTokens}/${tokenAmount} credits`
        )
      } else {
        // No breakdown — treat as full refund
        cumulativeRefundTokens = tokenAmount
        cumulativeRefundUsd = originalPrice
        console.log(
          `[paypal webhook] No breakdown on refund, deducting full ${tokenAmount} credits`
        )
      }

      // Cap at tokenAmount / originalPrice
      cumulativeRefundTokens = Math.min(cumulativeRefundTokens, tokenAmount)
      cumulativeRefundUsd = Math.min(cumulativeRefundUsd, originalPrice)

      if (resourceStatus === "PARTIALLY_REFUNDED" || cumulativeRefundTokens < tokenAmount) {
        action = "credits_partially_refunded"
      }

      // Only deduct the delta
      const deltaTokens = cumulativeRefundTokens - prevCumulative
      if (deltaTokens <= 0) {
        console.log(
          `[paypal webhook] No new refund delta: cumulative=${cumulativeRefundTokens}, ` +
          `prevCumulative=${prevCumulative} — already handled`
        )
        processed = true
        return
      }

      const userRows: any[] = await tx.$queryRawUnsafe(
        `SELECT credits FROM users WHERE id = $1 FOR UPDATE`,
        creditedTx.user_id
      )
      const currentBalance: number = userRows.length ? Number(userRows[0].credits) : 0

      await tx.$executeRawUnsafe(
        `UPDATE users SET credits = credits - $1 WHERE id = $2`,
        deltaTokens, creditedTx.user_id
      )

      const deducedFromPositive = Math.max(0, Math.min(deltaTokens, currentBalance))
      const pushedNegative = deltaTokens - deducedFromPositive

      // || merge — preserves original keys like status='completed'
      const refundMeta = JSON.stringify({
        refunded: true,
        lastRefundedAt: refundedAt,
        cumulativeRefundTokens,
        cumulativeRefundUsd,
        prevCumulativeRefundTokens: prevCumulative,
        deltaTokens,
        deducedFromPositive,
        pushedNegative,
        resourceStatus,
        refundEventId: body.id,
      })
      await tx.$executeRawUnsafe(
        `UPDATE transactions SET metadata = metadata::jsonb || $1::jsonb WHERE id = $2`,
        refundMeta, creditedTx.id
      )

      processed = true

      if (pushedNegative > 0) {
        console.error(
          `[paypal webhook] Refund shortfall: user ${creditedTx.user_id} ` +
          `delta=${deltaTokens}, balance was ${currentBalance}, ` +
          `${pushedNegative} pushed below zero (cumulative=${cumulativeRefundTokens}/${tokenAmount})`
        )
      } else {
        console.log(
          `[paypal webhook] Deducted delta=${deltaTokens} credits ` +
          `(cumulative=${cumulativeRefundTokens}/${tokenAmount}), ` +
          `user ${creditedTx.user_id}`
        )
      }
    })
  } catch (err: any) {
    console.error(`[paypal webhook] Credit refund tx failed:`, err?.message)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  if (!processed) {
    console.error(
      `[paypal webhook] Credit refund NOT processed for capture ${captureId} — will retry`
    )
    return NextResponse.json(
      { error: "No matching purchase found for refund" },
      { status: 404 }
    )
  }

  return NextResponse.json({ received: true, processed: true, action })
}

async function handleCreditEvent(body: PayPalWebhookEvent) {
  const resource = body.resource!
  const eventType = body.event_type!
  if (!resource) {
    return NextResponse.json({ error: "Missing resource" }, { status: 400 })
  }

  // ── Refund notification ──
  // PayPal can deliver PAYMENT.CAPTURE.REFUNDED with either:
  //   a) Capture resource → status REFUNDED/PARTIALLY_REFUNDED,
  //      amount = original (unchanged),
  //      seller_receivable_breakdown.total_refunded_amount = cumulative refund
  //   b) Refund resource → status COMPLETED, amount = this single refund,
  //      links[rel=up] → parent capture
  // Check event_type so case (b) doesn't fall through to the COMPLETED credit path.
  const isRefundEvent =
    eventType === "PAYMENT.CAPTURE.REFUNDED" || eventType === "PAYMENT.CAPTURE.REVERSED"

  if (isRefundEvent) {
    return handleCreditRefund(body)
  }

  // ── Completion (credit the user) ──
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
