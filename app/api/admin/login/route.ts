import { NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/admin-auth'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: Request) {
  try {
    const [body, parseError] = await safeJson<{ email?: string; password?: string }>(req)
    if (parseError) return parseError

    const email = body?.email?.trim()
    const password = body?.password
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@llmrpc.com'
    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAdminToken({ id: 1, email: adminEmail })

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Build cookie string without template literal to avoid escaping issues
    const cookieValue = [
      'admin_token=' + encodeURIComponent(token),
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Expires=' + expires.toUTCString(),
    ].join('; ')

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', cookieValue)
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
