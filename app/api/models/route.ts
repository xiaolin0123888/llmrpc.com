import { NextResponse } from 'next/server'
import { MODEL_MAPPING, MODEL_PRICING, PLAN_ACCESS } from '@/lib/models-config'

const PROVIDER_LABELS: Record<string, string> = {
  'deepseek': 'DeepSeek',
  'qwen': 'Qwen',
  'zhipu': 'Zhipu AI',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google': 'Google',
  'mistral': 'Mistral AI',
  '01-ai': '01.AI',
  'internlm': 'InternLM',
}

const CATEGORY_LABELS: Record<string, string> = {
  'deepseek': 'Text Generation',
  'qwen': 'Text Generation',
  'zhipu': 'Text Generation',
  'openai': 'Text Generation',
  'anthropic': 'Text Generation',
  'google': 'Text Generation',
  'mistral': 'Text Generation',
  '01-ai': 'Text Generation',
  'internlm': 'Text Generation',
}

export async function GET() {
  try {
    const models = Object.entries(MODEL_MAPPING).map(([shortName, realId]) => {
      const pricing = MODEL_PRICING[shortName]
      const providerPrefix = shortName.split('/')[0]
      const modelName = shortName.split('/')[1] || shortName

      // Determine min plan tier
      let planTier = 'Unlimited'
      for (const tier of ['Free', 'Basic', 'Pro', 'Enterprise', 'Unlimited'] as const) {
        if (PLAN_ACCESS[tier]?.includes(shortName)) { planTier = tier; break }
      }

      // Get accessible plans
      const tierIndex = ['Free', 'Basic', 'Pro', 'Enterprise', 'Unlimited'].indexOf(planTier)
      const accessiblePlans = ['Free', 'Basic', 'Pro', 'Enterprise', 'Unlimited'].slice(tierIndex)

      return {
        id: shortName,
        name: modelName,
        provider: PROVIDER_LABELS[providerPrefix] || providerPrefix,
        description: shortName,
        contextLen: 32768,
        inputPrice: pricing?.inputPrice ?? 0.5,
        outputPrice: pricing?.outputPrice ?? 1.0,
        modalities: ['text'],
        category: CATEGORY_LABELS[providerPrefix] || 'Text Generation',
        planTier,
        accessiblePlans,
      }
    })

    return NextResponse.json({ models })
  } catch (err) {
    console.error('[models error]', err)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
