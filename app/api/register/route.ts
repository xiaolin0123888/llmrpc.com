import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute, prisma } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
import { safeJson } from '@/lib/safe-json'

const VERIFY_EXPIRY_HOURS = 24
const REGISTER_BONUS = 1000000
const REFERRAL_BONUS = 500000
const IP_RATE_LIMIT = 3
const GLOBAL_RATE_LIMIT = 20

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '0.0.0.0'
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)

    // Parse body early so we can validate before the transaction
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

    const hashed = await bcrypt.hash(password, 12)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000)

    // ── Transaction: lock → recheck → insert ──
    // Both IP lock and global lock are held for the entire transaction.
    // This serializes registration so concurrent requests can't all pass the check.
    const result = await prisma.$transaction(async (tx) => {
      // Acquire both locks (held until transaction commits)
      await tx.$executeRawUnsafe(
        `SELECT pg_advisory_xact_lock(hashtext($1::text))`,
        `register_ip_` + clientIp
      )
      await tx.$executeRawUnsafe(
        `SELECT pg_advisory_xact_lock(hashtext($1::text))`,
        'register_global'
      )

      // Re-check counts under lock
      const ipRows: any[] = await tx.$queryRawUnsafe(
        `SELECT COUNT(*)::int as cnt FROM users
         WHERE registered_ip = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
        clientIp
      )
      if (ipRows[0]?.cnt >= IP_RATE_LIMIT) {
        return { error: 'Too many registrations from this IP. Please try again later.', status: 429 }
      }

      const globalRows: any[] = await tx.$queryRawUnsafe(
        `SELECT COUNT(*)::int as cnt FROM users
         WHERE created_at > NOW() - INTERVAL '1 hour'`
      )
      if (globalRows[0]?.cnt >= GLOBAL_RATE_LIMIT) {
        return { error: 'Registration temporarily unavailable. Please try again later.', status: 429 }
      }

      // Look up referrer
      let referredBy: string | null = null
      if (ref) {
        const refRows: any[] = await tx.$queryRawUnsafe(
          'SELECT id FROM users WHERE referral_code = $1', ref
        )
        if (refRows.length) referredBy = refRows[0].id
      }

      // Atomic insert — email UNIQUE prevents duplicates
      const insRows: any[] = referredBy
        ? await tx.$queryRawUnsafe(
            `INSERT INTO users (email, password, name, registered_ip, referred_by)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING
             RETURNING id`,
            email, hashed, email.split('@')[0], clientIp, referredBy
          )
        : await tx.$queryRawUnsafe(
            `INSERT INTO users (email, password, name, registered_ip)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING
             RETURNING id`,
            email, hashed, email.split('@')[0], clientIp
          )
      if (!insRows.length) {
        return { error: 'Email already registered', status: 409 }
      }

      const userId = insRows[0].id

      // Save verification token
      await tx.$executeRawUnsafe(
        'DELETE FROM email_verifications WHERE user_id = $1', userId
      )
      await tx.$executeRawUnsafe(
        'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
        userId, token, expires
      )

      return { userId, email }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    // ── Send email outside transaction ──
    // If email fails, user is created but unverified. They can register again
    // (will get 409, which prompts them to check email or contact support).
    try {
      const verifyUrl = `https://llmrpc.com/verify-email?token=${token}&email=${encodeURIComponent(email)}`
      await sendVerificationEmail(email, verifyUrl)
    } catch (emailErr) {
      console.error('[register] Verification email failed:', emailErr)
      // Don't fail the registration — user exists, email can be retried
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your address and receive your signup bonus.',
    })
  } catch (err: any) {
    console.error('[register error]', err?.message, err?.code)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
