import { NextRequest, NextResponse } from 'next/server'
import { getModels } from '@/lib/models'

export async function GET() {
  try {
    const models = await getModels()
    const data = (models || []).map((m: any) => ({
      id: m.id,
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
