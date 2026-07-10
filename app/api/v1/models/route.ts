import { NextRequest, NextResponse } from 'next/server'
import { extractApiKey, unauthorizedResponse, verifyApiKey } from '@/lib/api-auth'
import { normalizePlanName, PLAN_ACCESS } from '@/lib/models-config'

export async function GET(req: NextRequest) {
  const apiKey = extractApiKey(req)
  if (!apiKey) return unauthorizedResponse()

  if (process.env.LLM_PROXY_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'API proxy is temporarily unavailable while usage accounting is being hardened.' },
      { status: 503, headers: { 'Retry-After': '86400' } }
    )
  }

  try {
    const keyRecord = await verifyApiKey(apiKey)
    if (!keyRecord) return unauthorizedResponse('Invalid API key')

    const planName = normalizePlanName(keyRecord.plan)
    const data = PLAN_ACCESS[planName].map((id) => ({
      id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'llmrpc',
    }))
    return NextResponse.json({ object: 'list', data })
  } catch (err) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch models', type: 'server_error' } },
      { status: 500 }
    )
  }
}
