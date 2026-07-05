import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'llmrpc.com'
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const loginUrl = new URL('/login', proto + '://' + host)
  const response = NextResponse.redirect(loginUrl)
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

export async function POST(req: NextRequest) {
  return GET(req)
}
