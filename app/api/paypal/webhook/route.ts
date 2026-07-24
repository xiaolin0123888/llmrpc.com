import { NextRequest, NextResponse } from "next/server"
import { getOne, prisma } from "@/lib/db"
import { getPayPalAccess, verifyPaypalWebhookSignature } from "@/lib/paypal"
import { safeJson } from "@/lib/safe-json"

interface PayPalWebhookEvent {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    status?: string
    amount?: { value?: string; currency_code?: string }
    custom_id?: string
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id?: string
          status?: string
          amount?: { value?: string; currency_code?: string }
          custom_id?: string
        }>
      }
    }>
  }
}

// PayPal sends CHECKOUT.ORDER.APPROVED then PAYMENT.CAPTURE.COMPLETED
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
    // ── Extract order/capture details ──
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

    // ── Find matching local transaction by capture ID ──
    // Strategy 1: Look up by captureId in metadata (covers client-side capture + retries)
    let userId: string | null = null
    let expectedTokens: number | null = null
    let expectedPrice: string | null = null
    let orderId: string | null = null

    const dbTx = await getOne(
      `SELECT * FROM transactions
       WHERE type = 'PURCHASE'
         AND metadata::jsonb->>'paypalCaptureId' = $1
       ORDER BY created_at DESC LIMIT 1`,
      [captureId]
    )

    if (dbTx) {
      const meta = typeof dbTx.metadata === "string" ? JSON.parse(dbTx.metadata) : dbTx.metadata
      // Already credited — nothing to do
      if (meta?.status === "completed") {
        console.log(`[paypal webhook] Capture ${captureId} already credited, skipping`)
        return NextResponse.json({ received: true, processed: false, reason: "already_credited" })
      }
      userId = dbTx.user_id
      expectedTokens = meta?.tokens
      expectedPrice = meta?.price
      orderId = meta?.orderId
    }

    // Strategy 2: Try custom_id from the capture (set during order creation)
    if (!userId && resource.custom_id) {
      try {
        const custom = JSON.parse(resource.custom_id)
        userId = custom.userId || null
        expectedTokens = custom.tokens || null
        if (userId) {
          // Find the latest pending transaction for this user
          const pendingTx = await getOne(
            `SELECT * FROM transactions
             WHERE user_id = $1
               AND type = 'PURCHASE'
               AND metadata::jsonb->>'status' = 'pending'
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
          )
          if (pendingTx) {
            const meta = typeof pendingTx.metadata === "string" ? JSON.parse(pendingTx.metadata) : dbTx.metadata
            expectedTokens = meta?.tokens || custom.tokens
            expectedPrice = meta?.price
            orderId = meta?.orderId
          }
        }
      } catch {
        // custom_id may not be JSON
      }
    }

    if (!userId) {
      console.error("[paypal webhook] Could not determine user for capture", captureId)
      return NextResponse.json({ error: "User not found for capture" }, { status: 404 })
    }

    // ── Validate amount ──
    const tokenAmount = expectedTokens ? Number(expectedTokens) : null
    if (!tokenAmount || !Number.isSafeInteger(tokenAmount) || tokenAmount <= 0 || tokenAmount > 10_000_000) {
      console.error("[paypal webhook] Invalid token amount", expectedTokens)
      return NextResponse.json({ error: "Invalid token amount" }, { status: 400 })
    }

    if (capturedCurrency !== "USD") {
      console.error(`[paypal webhook] Unexpected currency: ${capturedCurrency}`)
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    // ── Credit user and mark transaction completed ──
    const credited = await prisma.$transaction(async (tx) => {
      // Find and update the pending transaction
      const txRows: any[] = await tx.$queryRawUnsafe(
        `UPDATE transactions
         SET description = $1, metadata = $2::jsonb
         WHERE user_id = $3
           AND type = 'PURCHASE'
           AND metadata::jsonb->>'status' = 'pending'
           AND (
             metadata::jsonb->>'orderId' = $4
             OR metadata::jsonb->>'paypalCaptureId' = $5
           )
           AND id = (
             SELECT id FROM transactions
             WHERE user_id = $3
               AND type = 'PURCHASE'
               AND metadata::jsonb->>'status' = 'pending'
               AND (
                 metadata::jsonb->>'orderId' = $4
                 OR metadata::jsonb->>'paypalCaptureId' = $5
               )
             ORDER BY created_at DESC LIMIT 1
           )
         RETURNING id`,
        `Purchased ${tokenAmount.toLocaleString()} credits via PayPal (webhook)`,
        JSON.stringify({
          provider: "paypal",
          orderId: orderId || "unknown",
          tokens: tokenAmount,
          status: "completed",
          paypalCaptureId: captureId,
          capturedAt: new Date().toISOString(),
          creditedVia: "webhook",
          price: expectedPrice || capturedAmount,
        }),
        userId,
        orderId || "",
        captureId
      )

      if (!txRows.length) {
        console.log(`[paypal webhook] No pending transaction found for user ${userId}, capture ${captureId}`)
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
      return NextResponse.json({ received: true, processed: false, reason: "no_pending_transaction" })
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
