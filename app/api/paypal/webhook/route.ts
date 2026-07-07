import { NextRequest, NextResponse } from 'next/server'

/**
 * PayPal Webhook Handler
 *
 * SECURITY: Webhook signature verification is REQUIRED before processing.
 * Without verification, anyone can POST fake PAYMENT.CAPTURE.COMPLETED events.
 *
 * Until PayPal webhook signature verification is implemented,
 * this handler only logs events for reconciliation purposes.
 * Actual credit addition happens via the client-side capture-order endpoint
 * which validates the PayPal order server-side before crediting.
 *
 * To implement signature verification:
 * 1. Set PAYPAL_WEBHOOK_ID in environment variables
 * 2. Use PayPal's verify-webhook-signature API
 * 3. Only process events after successful verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, id: webhookEventId } = body

    console.log(`[paypal webhook] Received ${event_type} (id: ${webhookEventId})`)
    console.log('[paypal webhook] NOTE: Auto-crediting disabled pending signature verification')

    // ================================================================
    // Webhook signature verification is DISABLED for security.
    // Re-enable only after implementing PayPal signature verification:
    //
    // 1. Get PayPal access token via OAuth
    // 2. POST to /v1/notifications/verify-webhook-signature
    // 3. Only process if verification_status == "SUCCESS"
    //
    // const verified = await verifyPaypalWebhookSignature(req, body)
    // if (!verified) {
    //   console.error('[paypal webhook] Signature verification FAILED')
    //   return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    // }
    // ================================================================

    // Log for reconciliation (no credit changes)
    return NextResponse.json({ received: true, processed: false, reason: 'signature_verification_required' })
  } catch (err) {
    console.error('[paypal webhook error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
