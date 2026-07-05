import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne } from '@/lib/db'
import { signAdminToken } from '@/lib/admin-auth'

// In-memory brute-force protection: count failed attempts per IP
type FailRecord = { count: number; lastFail: number }
const failedLog = new Map<string, FailRecord>()
const MAX_FAILS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

function getIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const now = Date.now()
  const record = failedLog.get(ip)

  if (record && record.count >= MAX_FAILS && now - record.lastFail < LOCKOUT_MS) {
    const left = Math.ceil((LOCKOUT_MS - (now - record.lastFail)) / 1000)
    return NextResponse.json({ error: `Too many attempts. Try again in ${left}s` }, { status: 429 })
  }

  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    const admin = await getOne('SELECT * FROM admin_users WHERE email = $1', [email])
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      const rec = failedLog.get(ip) || { count: 0, lastFail: 0 }
      failedLog.set(ip, { count: rec.count + 1, lastFail: now })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    // Success — clear fail counter
    failedLog.delete(ip)
    const token = signAdminToken({ id: admin.id, email: admin.email })
    return NextResponse.json({ token, email: admin.email })
  } catch (err) {
    console.error('[admin login error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
