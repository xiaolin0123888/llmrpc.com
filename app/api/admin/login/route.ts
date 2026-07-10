import { NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/admin-auth'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: Request) {
  try {
    const [body, parseError] = await safeJson<{ email?: string; password?: string }>(req)
    if (parseError) return parseError

    const email = body?.email?.trim()
    const password = body?.password

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
      console.error('[admin login] Required authentication environment variables are missing')
      return NextResponse.json({ error: 'Server error' }, { status: 503 })
    }

    if (!email || !password || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAdminToken({ id: 1, email: adminEmail, purpose: 'admin' })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
