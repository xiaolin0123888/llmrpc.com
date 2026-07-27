import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
import { safeJson } from '@/lib/safe-json'

const VERIFY_EXPIRY_HOURS = 24
const REGISTER_BONUS = 1000000
const REFERRAL_BONUS = 500000
const IP_RATE_LIMIT = 3        // max registrations per IP per hour
const GLOBAL_RATE_LIMIT = 20   // max total registrations per hour

// Extract real client IP: prefer nginx-set X-Real-IP, do NOT trust x-forwarded-for blindly.
// nginx is configured with proxy_set_header X-Real-IP $remote_addr;
function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  // No x-real-ip = not behind our trusted proxy; reject with placeholder
  return '0.0.0.0'
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)

    // ── Rate limit: per-IP ──
    const ipCount: any = await getOne(
      "SELECT COUNT(*)::int as cnt FROM users WHERE registered_ip = $1 AND created_at > NOW() - INTERVAL '1 hour'",
      [clientIp]
    )
    if (ipCount?.cnt >= IP_RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many registrations from this IP. Please try again later.' },
        { status: 429 }
      )
    }

    // ── Rate limit: global ──
    const globalCount: any = await getOne(
      "SELECT COUNT(*)::int as cnt FROM users WHERE created_at > NOW() - INTERVAL '1 hour'"
    )
    if (globalCount?.cnt >= GLOBAL_RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Registration temporarily unavailable. Please try again later.' },
        { status: 429 }
      )
    }

    const [body, parseError] = await safeJson<{ email?: string; password?: string; ref?: string }>(req)
    if (parseError) return parseError

    const email = body?.email?.trim().toLowerCase()
    const password = body?.password
    const ref = body?.ref?.trim()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    // Look up referrer by referral code
    let referredBy: string | null = null
    if (ref) {
      const referrer = await getOne('SELECT id FROM users WHERE referral_code = $1', [ref])
      if (referrer) referredBy = referrer.id
    }

    const hashed = await bcrypt.hash(password, 12)

    // Atomic INSERT — email is UNIQUE, so duplicate returns null
    // This eliminates the check-then-insert race condition
    const inserted = await getOne(
      referredBy
        ? `INSERT INTO users (email, password, name, registered_ip, referred_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING
           RETURNING id`
        : `INSERT INTO users (email, password, name, registered_ip)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
      referredBy
        ? [email, hashed, email.split('@')[0], clientIp, referredBy]
        : [email, hashed, email.split('@')[0], clientIp]
    )
    if (!inserted) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const user = inserted
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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
