import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// ── Rate limiting config ──
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000   // 1 hour window
const MAX_REGISTRATIONS_PER_IP = 3             //  max 3 registrations per IP per hour
const MAX_REGISTRATIONS_GLOBAL = 20            //  max 20 registrations total per hour (global)

// Simple in-memory rate limiter (resets on server restart — acceptable for MVP)
const ipRateMap = new Map<string, { count: number; resetAt: number }>()
let globalCount = 0
let globalResetAt = Date.now() + RATE_LIMIT_WINDOW_MS

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()

  // Global limit
  if (now > globalResetAt) {
    globalCount = 0
    globalResetAt = now + RATE_LIMIT_WINDOW_MS
  }
  if (globalCount >= MAX_REGISTRATIONS_GLOBAL) {
    return { allowed: false, retryAfter: Math.ceil((globalResetAt - now) / 1000) }
  }

  // Per-IP limit
  let entry = ipRateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    ipRateMap.set(ip, entry)
  }
  if (entry.count >= MAX_REGISTRATIONS_PER_IP) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  return { allowed: true }
}

// ── Disposable email domains (common temp email providers) ──
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'throwaway.email', 'yopmail.com', 'sharklasers.com',
  'trashmail.com', 'dispostable.com', 'maildrop.cc', 'getnada.com',
  'tempinbox.com', 'moakt.com', 'emailondeck.com', 'guerrillamail.org',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.net',
  'guerrillamail.de', 'spam4.me', 'wegwerfmail.de', 'fakeinbox.com',
  'tempail.com', 'tempmail.net', 'mailnesia.com', 'anonbox.net',
  'mohmal.com', 'bcaoo.com', 'chacuo.net', '027168.com',
])

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false
}

function isValidEmail(email: string): boolean {
  // RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// POST /api/register
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req)

    // ── Rate limit check ──
    const rateCheck = checkRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts',
          detail: `Please try again in ${rateCheck.retryAfter} seconds.`,
          retryAfter: rateCheck.retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter || 3600) },
        }
      )
    }

    const { email, password, name, referralCode } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // ── Email validation ──
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed. Please use a real email address.' },
        { status: 400 }
      )
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // ── Find referrer ──
    let referrerId: string | undefined
    if (referralCode && typeof referralCode === 'string' && referralCode.length <= 64) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer && referrer.id) referrerId = referrer.id
    }

    // ── Create user ──
    const hashedPassword = await bcrypt.hash(password, 12)

    // Count existing users from this IP in the last 24h (additional anti-abuse check)
    const recentFromIP = await prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        // Note: we don't store IP in user table, but we log it via transaction metadata
      },
    })

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 50) : email.split('@')[0],
        credits: 1_000_000, // 1M registration bonus
        referredBy: referrerId || null,
      },
    })

    // ── Credit referrer ──
    if (referrerId) {
      await prisma.user.update({
        where: { id: referrerId },
        data: {
          credits: { increment: 500_000 },
          referralCount: { increment: 1 },
        },
      })
      await prisma.transaction.create({
        data: {
          userId: referrerId,
          type: 'REFERRAL_BONUS',
          amount: 500_000,
          description: `Referral bonus for inviting ${email}`,
        },
      })
    }

    // Registration bonus transaction (with IP metadata for audit)
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'REGISTER_BONUS',
        amount: 1_000_000,
        description: 'New user registration bonus',
        metadata: { ip, timestamp: new Date().toISOString(), userAgent: req.headers.get('user-agent') || '' },
      },
    })

    // Increment rate limit counters
    const entry = ipRateMap.get(ip)!
    entry.count++
    globalCount++

    console.log(`[register] New user: ${email} (IP: ${ip})`)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
