import { NextResponse } from 'next/server'
import { MODEL_MAPPING, MODEL_PRICING, PLAN_ACCESS } from '@/lib/models-config'

// GET /api/v1/models – OpenAI-compatible models listing
// Only returns models in our supported whitelist (MODEL_MAPPING)
export async function GET() {
  try {
    const data = Object.keys(MODEL_MAPPING).map(id => {
      const pricing = MODEL_PRICING[id]
      // Determine min plan tier for this model
      let minPlan = 'Unlimited'
      for (const tier of ['Free', 'Basic', 'Pro', 'Enterprise', 'Unlimited'] as const) {
        if (PLAN_ACCESS[tier]?.includes(id)) { minPlan = tier; break }
      }
      return {
        id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'llmrpc',
        pricing: pricing ? {
          input_per_million: pricing.inputPrice,
          output_per_million: pricing.outputPrice,
        } : null,
        min_plan: minPlan,
      }
    })

    return NextResponse.json({ object: 'list', data })
  } catch (err) {
    console.error('[v1/models error]', err)
    return NextResponse.json(
      { error: { message: 'Failed to fetch models', type: 'server_error' } },
      { status: 500 }
    )
  }
}
