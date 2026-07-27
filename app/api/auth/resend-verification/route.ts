import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

const VERIFY_EXPIRY_HOURS = 24
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000  // 5 min between resend requests

// In-memory rate limit (per email). Server restart clears it — acceptable for this endpoint.
const resendCooldown = new Map<string, number>()

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

    // Rate limit
    const lastSent = resendCooldown.get(email) || 0
    const now = Date.now()
    if (now - lastSent < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Please wait before requesting another verification email' },
        { status: 429 }
      )
    }
    resendCooldown.set(email, now)

    // Don't reveal whether email is registered — same response either way
    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
    }

    // Check if already verified
    const bonusTx = await getOne(
      "SELECT id FROM transactions WHERE user_id = $1 AND type = 'REGISTER_BONUS' LIMIT 1",
      user.id
    )
    if (bonusTx) {
      // Same response — don't leak that email is verified
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a verification link has been sent.' })
    }

    // Generate new token FIRST, then replace old one atomically
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000)

    // Replace old token with new one in a single transaction
    await execute('DELETE FROM email_verifications WHERE user_id = $1', [user.id])
    await execute(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expires]
    )

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
