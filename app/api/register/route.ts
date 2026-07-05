import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

const VERIFY_EXPIRY_HOURS = 24
const REGISTER_BONUS = 100000
const REFERRAL_BONUS = 150000

export async function POST(req: NextRequest) {
  try {
    const { email, password, ref } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Look up referrer by referral code
    let referredBy: string | null = null
    if (ref) {
      const referrer = await getOne('SELECT id FROM users WHERE referral_code = $1', [ref])
      if (referrer) referredBy = referrer.id
    }

    const hashed = await bcrypt.hash(password, 12)

    // Create user — if referred, store referred_by (bonus given after email verify)
    await execute(
      referredBy
        ? 'INSERT INTO users (email, password, name, referred_by) VALUES ($1, $2, $3, $4)'
        : 'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
      referredBy ? [email, hashed, email.split('@')[0], referredBy] : [email, hashed, email.split('@')[0]]
    )
    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (!user) return NextResponse.json({ error: 'Internal error' }, { status: 500 })

    // Generate verification token (expires in 24h)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000)
    await execute('DELETE FROM email_verifications WHERE user_id = $1', [user.id])
    await execute(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expires]
    )

    // Send verification email — bonus NOT credited yet
    const verifyUrl = `https://llmrpc.com/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    await sendVerificationEmail(email, verifyUrl)

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your address and receive your signup bonus.',
    })
  } catch (err: any) {
    console.error('[register error]', err?.message, err?.code)
    return NextResponse.json({ error: 'Internal error: ' + (err?.message || err) }, { status: 500 })
  }
}
