import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const headers = new Headers(req.headers)
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
    const apiKey = req.headers.get('x-api-key')
    const authHeader = req.headers.get('authorization')
    const keyValue = apiKey || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)

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
