// Model configuration — unified AI API gateway
// All 28 model IDs verified against production upstream (2026-07-27)
// Sorted by capability: flagship → reasoning → large → mid → fast → budget
// Source: https://llmrpc.com/api/models (live upstream, text-only chat models)

export const MODEL_MAPPING: Record<string, string> = {
  // ── Flagship ──
  'deepseek-v4-pro':  'deepseek-ai/DeepSeek-V4-Pro',

  // ── Reasoning ──
  'deepseek-r1':      'deepseek-ai/DeepSeek-R1',

  // ── Large-scale ──
  'qwen3.5-397b':     'Qwen/Qwen3.5-397B-A17B',
  'qwen3.5-122b':     'Qwen/Qwen3.5-122B-A10B',

  // ── Latest generation ──
  'deepseek-v3':      'deepseek-ai/DeepSeek-V3.2',
  'qwen3.6-35b':      'Qwen/Qwen3.6-35B-A3B',
  'qwen3.6-27b':      'Qwen/Qwen3.6-27B',
  'kimi-k2.6':        'Pro/moonshotai/Kimi-K2.6',

  // ── Strong mid-tier ──
  'nex-n2-pro':       'nex-agi/Nex-N2-Pro',
  'glm-5.1':          'Pro/zai-org/GLM-5.1',
  'deepseek-v3.1':    'deepseek-ai/DeepSeek-V3.1-Terminus',
  'qwen3.5-35b':      'Qwen/Qwen3.5-35B-A3B',
  'qwen3-32b':        'Qwen/Qwen3-32B',
  'qwen3.5-27b':      'Qwen/Qwen3.5-27B',
  'seed-oss-36b':     'ByteDance-Seed/Seed-OSS-36B-Instruct',
  'minimax-m2.5':     'Pro/MiniMaxAI/MiniMax-M2.5',

  // ── Fast / efficient ──
  'deepseek-v4-flash': 'deepseek-ai/DeepSeek-V4-Flash',
  'glm-5.2':          'zai-org/GLM-5.2',
  'kimi-k2.7-code':   'moonshotai/Kimi-K2.7-Code',
  'qwen3-coder':      'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'step-3.5-flash':   'stepfun-ai/Step-3.5-Flash',
  'hunyuan-a13b':     'tencent/Hunyuan-A13B-Instruct',
  'ling-flash-2.0':   'inclusionAI/Ling-flash-2.0',

  // ── Small / budget ──
  'qwen3-30b':        'Qwen/Qwen3-30B-A3B-Instruct-2507',
  'deepseek-r1-8b':   'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  'qwen3.5-9b':       'Qwen/Qwen3.5-9B',
  'glm-4.5-air':      'zai-org/GLM-4.5-Air',
  'longcat-2.0':      'meituan-longcat/LongCat-2.0',
}

// Flat pricing: 1 credit = 1 token, all models.
// $1 = 100K credits. Proxy charges actual prompt+completion tokens.
export const MODEL_PRICING: Record<string, { inputPrice: number; outputPrice: number }> = {
  'deepseek-v4-pro':   { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1':       { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-397b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-122b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3':       { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.6-35b':       { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.6-27b':       { inputPrice: 1.0, outputPrice: 1.0 },
  'kimi-k2.6':         { inputPrice: 1.0, outputPrice: 1.0 },
  'nex-n2-pro':        { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.1':           { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3.1':     { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-35b':       { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-32b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-27b':       { inputPrice: 1.0, outputPrice: 1.0 },
  'seed-oss-36b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'minimax-m2.5':      { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v4-flash': { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.2':           { inputPrice: 1.0, outputPrice: 1.0 },
  'kimi-k2.7-code':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-coder':       { inputPrice: 1.0, outputPrice: 1.0 },
  'step-3.5-flash':    { inputPrice: 1.0, outputPrice: 1.0 },
  'hunyuan-a13b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'ling-flash-2.0':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-30b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1-8b':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-9b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-4.5-air':       { inputPrice: 1.0, outputPrice: 1.0 },
  'longcat-2.0':       { inputPrice: 1.0, outputPrice: 1.0 },
}

export function getUserFacingModelId(siliconId: string): string | null {
  for (const [friendly, upstream] of Object.entries(MODEL_MAPPING)) {
    if (upstream === siliconId) return friendly
  }
  return null
}

export function getModelPrice(modelId: string) {
  return MODEL_PRICING[modelId] || { inputPrice: 1.0, outputPrice: 1.0 }
}

// System personas — brief, no brand impersonation
const MODEL_PERSONAS: Record<string, string> = {}
export function injectPersona(modelId: string, messages: any[]): any[] { return messages }

// Plan-based model access gates
const ALL = Object.keys(MODEL_MAPPING)
const BUDGET = ['deepseek-v4-flash', 'deepseek-v3', 'glm-5.2', 'qwen3-32b', 'qwen3.6-27b', 'qwen3.5-27b', 'glm-4.5-air', 'longcat-2.0']
const MID = [...BUDGET, 'deepseek-v4-pro', 'deepseek-v3.1', 'qwen3.6-35b', 'qwen3.5-35b', 'glm-5.1', 'qwen3-30b', 'qwen3.5-9b', 'ling-flash-2.0', 'step-3.5-flash', 'hunyuan-a13b', 'deepseek-r1-8b']
const PRO = [...MID, 'deepseek-r1', 'kimi-k2.6', 'qwen3.5-397b', 'qwen3.5-122b', 'nex-n2-pro', 'seed-oss-36b', 'minimax-m2.5', 'kimi-k2.7-code', 'qwen3-coder']

export const PLAN_ACCESS: Record<string, string[]> = {
  'Free':       BUDGET,
  'Basic':      MID,
  'Pro':        PRO,
  'Enterprise': ALL,
  'Unlimited':  ALL,
}

export function styleModelFilter(showModel: string, content: string): string {
  if (!content) return content
  const banWords: string[] = []
  let filtered = content
  for (const bw of banWords) {
    filtered = filtered.split(bw).join('')
  }
  filtered = filtered.replace(/\\n{3,}/g, '\\n\\n')
  return filtered.trim()
}

export function checkAntiSpider(userAgent: string): boolean {
  const spiderKeywords = ['python-requests', 'curl', 'wget', 'scrapy', 'java/', 'go-http', 'ruby', 'php']
  const ua = userAgent.toLowerCase()
  return spiderKeywords.some((k: string) => ua.indexOf(k) !== -1)
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
