import { NextRequest, NextResponse } from 'next/server'
import { getOne, prisma } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

const VERIFY_EXPIRY_HOURS = 24
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000  // 5 min between resend requests

// In-memory rate limit (per email).
// NOTE: single-process only. For multi-process deployments, replace with Redis or DB-based rate limit.
const resendCooldown = new Map<string, number>()

// Periodic cleanup: purge stale cooldown entries every ~100 requests
let cleanupCounter = 0
function maybeCleanupCooldown(now: number) {
  cleanupCounter++
  if (cleanupCounter % 100 !== 0) return
  for (const [key, ts] of resendCooldown) {
    if (now - ts > RATE_LIMIT_WINDOW_MS) resendCooldown.delete(key)
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: { email?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const now = Date.now()

    // Don't reveal whether email is registered — same response either way
    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
    }

    // Check if already verified
    const bonusTx = await getOne(
      "SELECT id FROM transactions WHERE user_id = $1 AND type = 'REGISTER_BONUS' LIMIT 1",
      [user.id]
    )
    if (bonusTx) {
      // Same response — don't leak that email is verified
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
    }

    // Rate limit — only for valid, unverified registered users (after DB queries above)
    const lastSent = resendCooldown.get(email) || 0
    if (now - lastSent < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Please wait before requesting another verification email' },
        { status: 429 }
      )
    }
    resendCooldown.set(email, now)
    maybeCleanupCooldown(now)

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000)

    // Atomically replace old token with new one in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('DELETE FROM email_verifications WHERE user_id = $1', user.id)
      await tx.$executeRawUnsafe(
        'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
        user.id, token, expires
      )
    })

    // Send email AFTER token is saved — if email fails, new token is still valid
    const verifyUrl = `https://llmrpc.com/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    try {
      await sendVerificationEmail(email, verifyUrl)
    } catch (emailErr) {
      console.error('[resend-verify] Email send failed:', emailErr)
      // Token is already saved — user can try again
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
    }

    return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
  } catch (err: any) {
    console.error('[resend-verify error]', err?.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
