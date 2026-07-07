import { NextRequest, NextResponse } from 'next/server'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: NextRequest) {
  const [body, parseError] = await safeJson<Record<string, any>>(req)
  if (parseError) return parseError
  if (!body) {
    return NextResponse.json(
      { error: { message: 'Request body required', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  const apiKey = req.headers.get('x-api-key')
  const authHeader = req.headers.get('authorization')
  const keyValue = apiKey || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null)
  
  const headers = new Headers(req.headers)
  if (keyValue) headers.set('x-api-key', keyValue)
  const proxyUrl = new URL('/api/proxy', req.url)
  
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    if (!keyValue) {
      return NextResponse.json(
        { error: { message: 'API key required. Use Authorization: Bearer sk-...', type: 'authentication_error' } },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: { message: 'Internal routing error', type: 'server_error' } },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: { message: 'Method not allowed. Use POST.', type: 'invalid_request_error' } },
    { status: 405 }
  )
}
