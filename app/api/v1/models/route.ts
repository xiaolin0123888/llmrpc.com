import { NextResponse } from 'next/server'
import { MODEL_MAPPING, getModelPrice } from '@/lib/models-config'

// Provider display names
const PROVIDER_LABELS: Record<string, string> = {
  'deepseek-ai': 'DeepSeek',
  'zai-org': 'GLM',
  'Qwen': 'Qwen',
  'moonshotai': 'Kimi',
}

export async function GET() {
  try {
    const data = Object.entries(MODEL_MAPPING).map(([id, upstreamId]) => {
      const parts = upstreamId.split('/')
      const provider = PROVIDER_LABELS[parts[0]] || parts[0]
      return { id, object: 'model', created: 1750000000, owned_by: provider }
    })
    return NextResponse.json({ object: 'list', data })
  } catch (err) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch models', type: 'server_error' } },
      { status: 500 }
    )
  }
}
