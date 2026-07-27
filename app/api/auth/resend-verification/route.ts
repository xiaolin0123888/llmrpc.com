import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

const VERIFY_EXPIRY_HOURS = 24

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body?.email?.trim()?.toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true, message: 'If the email is registered and unverified, a new verification link has been sent.' })
    }

    // Check if already verified
    const bonusTx = await getOne(
      "SELECT id FROM transactions WHERE user_id = $1 AND type = 'REGISTER_BONUS' LIMIT 1",
      [user.id]
    )
    if (bonusTx) {
      return NextResponse.json({ success: true, message: 'Email already verified. You can log in.' })
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000)
    await execute('DELETE FROM email_verifications WHERE user_id = $1', [user.id])
    await execute(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expires]
    )

    const verifyUrl = `https://llmrpc.com/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    await sendVerificationEmail(email, verifyUrl)

    return NextResponse.json({ success: true, message: 'Verification email sent. Please check your inbox.' })
  } catch (err: any) {
    console.error('[resend-verify error]', err?.message)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}
