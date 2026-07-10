import { NextResponse } from 'next/server'
import { getOne } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: Request) {
  try {
    const [body, parseError] = await safeJson<{ email?: string; password?: string }>(req)
    if (parseError) return parseError

    const email = body?.email?.trim().toLowerCase()
    const password = body?.password

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await getOne('SELECT id, email, name, password, is_banned FROM users WHERE email = $1', [email])
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let valid = false
    try {
      valid = await bcrypt.compare(password, user.password)
    } catch (e: any) {
      console.error('bcrypt error:', e.message)
      return NextResponse.json({ error: 'Auth error' }, { status: 500 })
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.is_banned) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e: any) {
    console.error('Login error:', e.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
