import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute } from '@/lib/db'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: NextRequest) {
  try {
    const [body, parseError] = await safeJson<{ token?: string; password?: string }>(req)
    if (parseError) return parseError

    const token = body?.token
    const password = body?.password
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const record = await getOne(
      'SELECT email FROM password_resets WHERE token = $1 AND expires > NOW() ORDER BY expires DESC LIMIT 1',
      [token]
    )
    if (!record) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 12)
    await execute('UPDATE users SET password = $1 WHERE email = $2', [hashed, record.email])
    await execute('DELETE FROM password_resets WHERE email = $1', [record.email])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
