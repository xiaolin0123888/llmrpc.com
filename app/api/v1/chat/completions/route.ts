import { NextRequest, NextResponse } from 'next/server'
import { extractApiKey, unauthorizedResponse } from '@/lib/api-auth'
import { safeJson } from '@/lib/safe-json'

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req)
  if (!apiKey) return unauthorizedResponse()

  const [body, parseError] = await safeJson<Record<string, unknown>>(req)
  if (parseError) return parseError
  if (!body) {
    return NextResponse.json(
      { error: { message: 'Request body required', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  try {
    const proxyUrl = new URL('/api/proxy', req.url)
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
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
