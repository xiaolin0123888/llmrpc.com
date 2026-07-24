import { NextRequest, NextResponse } from "next/server"
import { getOne, prisma } from "@/lib/db"
import { verifyPaypalWebhookSignature } from "@/lib/paypal"

interface PayPalWebhookEvent {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    status?: string
    amount?: { value?: string; currency_code?: string }
    custom_id?: string
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
  }
}

// We only credit on PAYMENT.CAPTURE.COMPLETED (funds confirmed settled).
const CREDIT_EVENT_TYPES = ["PAYMENT.CAPTURE.COMPLETED"]

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
  // ── Read raw body for signature verification BEFORE JSON parsing ──
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 })
  }

  // Parse JSON from raw body (we already consumed it via .text())
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

  // ── Verify signature ──
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

  // ── Only process credit events ──
  if (!CREDIT_EVENT_TYPES.includes(eventType)) {
    console.log(`[paypal webhook] Ignoring event type: ${eventType}`)
    return NextResponse.json({ received: true, processed: false, reason: "event_type_not_handled" })
  }

  try {
    const resource = body.resource
    if (!resource) {
      console.error("[paypal webhook] Missing resource in event body")
      return NextResponse.json({ error: "Missing resource" }, { status: 400 })
    }

    // PAYMENT.CAPTURE.COMPLETED: resource is the capture object
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

    // ── Resolve the exact PayPal order ID ──
    // PayPal provides it at resource.supplementary_data.related_ids.order_id
    const paypalOrderId: string | null =
      resource.supplementary_data?.related_ids?.order_id || null

    // ── Find matching local transaction ──
    // Strategy 1: match by exact PayPal orderId (most reliable)
    // Strategy 2: match by captureId (covers client-side captured transactions)
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
      console.error("[paypal webhook] No local transaction found for order", paypalOrderId, "capture", captureId)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const meta =
      typeof localTx.metadata === "string"
        ? JSON.parse(localTx.metadata)
        : localTx.metadata

    // Already credited — idempotent, nothing to do
    if (meta?.status === "completed") {
      console.log(`[paypal webhook] Order ${paypalOrderId} already credited, skipping`)
      return NextResponse.json({ received: true, processed: false, reason: "already_credited" })
    }

    const userId: string = localTx.user_id
    const tokenAmount = Number(meta?.tokens)
    const expectedPrice = meta?.price

    if (!Number.isSafeInteger(tokenAmount) || tokenAmount <= 0 || tokenAmount > 10_000_000) {
      console.error("[paypal webhook] Invalid token amount in local tx", meta?.tokens)
      return NextResponse.json({ error: "Invalid token amount" }, { status: 400 })
    }

    // ── Verify the captured amount matches the expected purchase ──
    if (expectedPrice && capturedAmount !== expectedPrice) {
      console.error(
        `[paypal webhook] Amount mismatch: expected ${expectedPrice} USD, got ${capturedAmount} USD`
      )
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
    }

    // ── Credit user and mark transaction completed ──
    const credited = await prisma.$transaction(async (tx) => {
      const txRows: any[] = await tx.$queryRawUnsafe(
        `UPDATE transactions
         SET description = $1, metadata = $2::jsonb
         WHERE id = $3
           AND user_id = $4
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

    console.log(`[paypal webhook] Credited ${tokenAmount} tokens to user ${userId} via webhook`)
    return NextResponse.json({ received: true, processed: true, tokens: tokenAmount })
  } catch (err: any) {
    if (isNetworkError(err)) {
      console.error("[paypal webhook] Network error during processing:", err.message)
      return NextResponse.json({ error: "PayPal service unreachable" }, { status: 503 })
    }
    console.error("[paypal webhook] Processing error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
