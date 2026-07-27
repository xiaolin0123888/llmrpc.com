// Model configuration — unified AI API gateway
// All model IDs verified against production server upstream (2026-07-27)
// Source: https://llmrpc.com/api/models (91 live upstream models)

export const MODEL_MAPPING: Record<string, string> = {
  // DeepSeek
  'deepseek-v4-pro':   'deepseek-ai/DeepSeek-V4-Pro',
  'deepseek-v4-flash': 'deepseek-ai/DeepSeek-V4-Flash',
  'deepseek-v3':       'deepseek-ai/DeepSeek-V3.2',
  'deepseek-r1':       'deepseek-ai/DeepSeek-R1',

  // GLM
  'glm-5.2':  'zai-org/GLM-5.2',
  'glm-5.1':  'Pro/zai-org/GLM-5.1',

  // Qwen
  'qwen3-32b':   'Qwen/Qwen3-32B',
  'qwen3.6-27b': 'Qwen/Qwen3.6-27B',
  'qwen3-coder': 'Qwen/Qwen3-Coder-30B-A3B-Instruct',

  // Kimi
  'kimi-k2.6': 'Pro/moonshotai/Kimi-K2.6',
}

// Pricing is uniform: 1 credit = 1 token across all models.
// MODEL_PRICING below is for /models page display only.
// Actual charges: proxy deducts actual tokens (prompt+completion) from credit balance.
// $1.00 = 100K credits.
export const MODEL_PRICING: Record<string, { inputPrice: number; outputPrice: number }> = {
  'deepseek-v4-pro':   { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v4-flash': { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3':       { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1':       { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.2':           { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.1':           { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-32b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.6-27b':       { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-coder':       { inputPrice: 1.0, outputPrice: 1.0 },
  'kimi-k2.6':         { inputPrice: 1.0, outputPrice: 1.0 },
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

// System prompts — no brand impersonation, just helpful AI behavior
const MODEL_PERSONAS: Record<string, string> = {
  'deepseek-v4-pro':   'You are a helpful, knowledgeable AI assistant powered by DeepSeek V4 Pro. Respond clearly and accurately.',
  'deepseek-v4-flash': 'You are a fast, efficient AI assistant powered by DeepSeek V4 Flash. Keep responses concise.',
  'deepseek-v3':       'You are a capable AI assistant powered by DeepSeek V3.2. Provide clear, well-organized responses.',
  'deepseek-r1':       'You are a reasoning-focused AI assistant powered by DeepSeek R1. Think step by step for complex problems.',
  'glm-5.2':           'You are a helpful AI assistant powered by GLM-5.2. Keep answers clear, practical, and efficient.',
  'glm-5.1':           'You are a capable, balanced AI assistant powered by GLM-5.1. Provide thorough, well-organized responses.',
  'qwen3-32b':         'You are a capable AI assistant powered by Qwen3-32B. Keep responses helpful and concise.',
  'qwen3.6-27b':       'You are a fast, efficient AI assistant powered by Qwen3.6-27B. Provide clear, practical answers.',
  'qwen3-coder':       'You are a coding-focused AI assistant powered by Qwen3-Coder. Write clean, well-documented code.',
  'kimi-k2.6':         'You are a helpful AI assistant powered by Kimi K2.6. Provide thorough, well-organized responses.',
}

export function injectPersona(modelId: string, messages: any[]): any[] {
  if (!MODEL_PERSONAS[modelId]) return messages
  const hasSystem = messages.some((m: any) => m.role === 'system')
  if (hasSystem) return messages
  return [{ role: 'system', content: MODEL_PERSONAS[modelId] }, ...messages]
}

export const PLAN_ACCESS: Record<string, string[]> = {
  'Free':       ['deepseek-v4-flash', 'deepseek-v3', 'glm-5.2', 'qwen3-32b', 'qwen3.6-27b'],
  'Basic':      ['deepseek-v4-flash', 'deepseek-v3', 'glm-5.2', 'glm-5.1', 'qwen3-32b', 'qwen3.6-27b'],
  'Pro':        ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-v3', 'deepseek-r1', 'glm-5.2', 'glm-5.1', 'qwen3-32b', 'qwen3.6-27b', 'kimi-k2.6'],
  'Enterprise': Object.keys(MODEL_MAPPING),
  'Unlimited':  Object.keys(MODEL_MAPPING),
}

export function styleModelFilter(showModel: string, content: string): string {
  if (!content) return content
  const banWords: string[] = []
  let filtered = content
  for (const bw of banWords) {
    filtered = filtered.split(bw).join('')
  }
  filtered = filtered.replace(/\n{3,}/g, '\n\n')



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
