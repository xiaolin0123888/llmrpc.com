import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/models', '/billing', '/privacy', '/refund', '/terms', '/referrals', '/forgot-password', '/reset-password']
const ADMIN_PATHS = ['/admin/login']
const PUBLIC_API_PATHS = [
  '/api/auth', '/api/login', '/api/register', '/api/models', '/api/plans', '/api/proxy', '/api/credits', '/api/keys',
  '/api/admin/login', '/v1/chat/completions',
  '/api/admin/stats', '/api/admin/users', '/api/admin/orders', '/api/admin/plans',
  '/api/admin/keys', '/api/admin/announcements',
]

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    try { cookies[key] = decodeURIComponent(val) } catch { cookies[key] = val }
  }
  return cookies
}

function getToken(req: NextRequest): Record<string, any> | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  const token = cookies['auth_token']
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    return payload
  } catch { return null }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  for (const p of PUBLIC_API_PATHS) {
    if (pathname.startsWith(p)) return NextResponse.next()
  }

  if (ADMIN_PATHS.some(p => pathname === p)) return NextResponse.next()

  if (pathname.startsWith('/admin') && !ADMIN_PATHS.includes(pathname)) {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = parseCookies(cookieHeader)
    const adminToken = req.headers.get('x-admin-token') || cookies['admin_token']
    if (!adminToken) return NextResponse.redirect(new URL('/admin/login', req.url))
    return NextResponse.next()
  }

  if (pathname === '/login' || pathname === '/register') {
    const token = getToken(req)
    if (token?.userId) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some(p => pathname === p)) return NextResponse.next()

  const token = getToken(req)
  if (!token?.userId) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
