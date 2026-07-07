import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/announcements', '/login', '/register', '/models', '/billing', '/privacy', '/refund', '/terms', '/referrals', '/forgot-password', '/reset-password']
const ADMIN_PATHS = ['/admin/login']

// Paths that should NEVER redirect to an HTML login page.
// These are either public or return JSON 401 from the route handler.
const JSON_ROUTES = [
  '/api/', '/v1/', '/robots.txt', '/sitemap.xml', '/.well-known/',
  '/api/admin/',
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

  // API/JSON routes — never redirect to HTML login page
  for (const p of JSON_ROUTES) {
    if (pathname.startsWith(p)) return NextResponse.next()
  }

  // Public pages — skip auth (must be before login/register redirect)
  if (PUBLIC_PATHS.some(p => pathname === p)) return NextResponse.next()

  if (ADMIN_PATHS.some(p => pathname === p)) return NextResponse.next()

  if (pathname.startsWith('/admin') && !ADMIN_PATHS.includes(pathname)) {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = parseCookies(cookieHeader)
    const adminToken = req.headers.get('x-admin-token') || cookies['admin_token']
    if (!adminToken) return NextResponse.redirect(new URL('/admin/login', req.url))
    return NextResponse.next()
  }

  // Logged-in users visiting /login or /register → redirect to dashboard
  if (pathname === '/login' || pathname === '/register') {
    const token = getToken(req)
    if (token?.userId) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

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
