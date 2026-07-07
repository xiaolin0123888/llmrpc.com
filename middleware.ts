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

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const hasAuthToken = Boolean(req.cookies.get('auth_token')?.value)

  // API/JSON routes — never redirect to HTML login page
  for (const p of JSON_ROUTES) {
    if (pathname.startsWith(p)) return NextResponse.next()
  }

  // Public pages — skip auth (must be before login/register redirect)
  if (PUBLIC_PATHS.some(p => pathname === p)) return NextResponse.next()

  if (ADMIN_PATHS.some(p => pathname === p)) return NextResponse.next()

  if (pathname.startsWith('/admin') && !ADMIN_PATHS.includes(pathname)) {
    const adminToken = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
    if (!adminToken) return NextResponse.redirect(new URL('/admin/login', req.url))
    return NextResponse.next()
  }

  // Logged-in users visiting /login or /register → redirect to dashboard
  if (pathname === '/login' || pathname === '/register') {
    if (hasAuthToken) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  if (!hasAuthToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
