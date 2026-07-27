// Model configuration — unified AI API gateway
// 60 models, all verified against production upstream (2026-07-27)
// Includes text chat, VL, Omni, LoRA, and Pro variants
// Excludes: embedding, reranker, image gen, video gen, OCR, ASR, TTS, MT

export const MODEL_MAPPING: Record<string, string> = {

  // Flagship
  'deepseek-v4-pro':     'deepseek-ai/DeepSeek-V4-Pro',

  // Reasoning
  'deepseek-r1':         'deepseek-ai/DeepSeek-R1',
  'deepseek-r1-pro':     'Pro/deepseek-ai/DeepSeek-R1',

  // Large-scale
  'qwen3.5-397b':        'Qwen/Qwen3.5-397B-A17B',
  'qwen3.5-122b':        'Qwen/Qwen3.5-122B-A10B',
  'qwen2.5-72b-128k':    'Qwen/Qwen2.5-72B-Instruct-128K',
  'qwen2.5-72b':         'Qwen/Qwen2.5-72B-Instruct',

  // Latest generation
  'deepseek-v3':         'deepseek-ai/DeepSeek-V3.2',
  'qwen3.6-35b':         'Qwen/Qwen3.6-35B-A3B',
  'qwen3.6-27b':         'Qwen/Qwen3.6-27B',
  'kimi-k2.6':           'Pro/moonshotai/Kimi-K2.6',

  // Strong mid-tier
  'nex-n2-pro':          'nex-agi/Nex-N2-Pro',
  'glm-5.1':             'Pro/zai-org/GLM-5.1',
  'deepseek-v3.1':       'deepseek-ai/DeepSeek-V3.1-Terminus',
  'deepseek-v3.1-pro':   'Pro/deepseek-ai/DeepSeek-V3.1-Terminus',
  'qwen3.5-35b':         'Qwen/Qwen3.5-35B-A3B',
  'glm-4-32b':           'THUDM/GLM-4-32B-0414',

  // Vision-language
  'qwen3-vl-32b':        'Qwen/Qwen3-VL-32B-Instruct',
  'qwen3-vl-32b-t':      'Qwen/Qwen3-VL-32B-Thinking',
  'qwen3-vl-30b':        'Qwen/Qwen3-VL-30B-A3B-Instruct',
  'qwen3-vl-30b-t':      'Qwen/Qwen3-VL-30B-A3B-Thinking',
  'qwen3-vl-8b':         'Qwen/Qwen3-VL-8B-Instruct',
  'qwen3-vl-8b-t':       'Qwen/Qwen3-VL-8B-Thinking',
  'glm-4.5v':            'zai-org/GLM-4.5V',

  // Omni (multi-modal)
  'qwen3-omni-30b':      'Qwen/Qwen3-Omni-30B-A3B-Instruct',
  'qwen3-omni-30b-t':    'Qwen/Qwen3-Omni-30B-A3B-Thinking',

  // Balanced
  'qwen3-32b':           'Qwen/Qwen3-32B',
  'qwen2.5-32b':         'Qwen/Qwen2.5-32B-Instruct',
  'qwen3.5-27b':         'Qwen/Qwen3.5-27B',
  'qwen3-14b':           'Qwen/Qwen3-14B',
  'seed-oss-36b':        'ByteDance-Seed/Seed-OSS-36B-Instruct',
  'minimax-m2.5-basic':  'MiniMaxAI/MiniMax-M2.5',

  // Fast / efficient
  'deepseek-v4-flash':   'deepseek-ai/DeepSeek-V4-Flash',
  'glm-5.2':             'zai-org/GLM-5.2',
  'kimi-k2.7-code':      'moonshotai/Kimi-K2.7-Code',
  'qwen3-coder':         'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'step-3.5-flash':      'stepfun-ai/Step-3.5-Flash',
  'hunyuan-a13b':        'tencent/Hunyuan-A13B-Instruct',
  'qwen2.5-14b':         'Qwen/Qwen2.5-14B-Instruct',
  'ling-flash-2.0':      'inclusionAI/Ling-flash-2.0',
  'ling-mini-2.0':       'inclusionAI/Ling-mini-2.0',

  // Small / budget
  'deepseek-v3-basic':   'deepseek-ai/DeepSeek-V3',
  'qwen3-30b':           'Qwen/Qwen3-30B-A3B-Instruct-2507',
  'deepseek-r1-8b':      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  'qwen2.5-7b':          'Qwen/Qwen2.5-7B-Instruct',
  'qwen3-8b':            'Qwen/Qwen3-8B',
  'glm-4-9b':            'THUDM/GLM-4-9B-0414',
  'glm-z1-9b':           'THUDM/GLM-Z1-9B-0414',
  'qwen3.5-9b':          'Qwen/Qwen3.5-9B',
  'glm-4.5-air':         'zai-org/GLM-4.5-Air',
  'qwen3.5-4b':          'Qwen/Qwen3.5-4B',
  'longcat-2.0':         'meituan-longcat/LongCat-2.0',

  // LoRA fine-tunes
  'lora-qwen2.5-7b':     'LoRA/Qwen/Qwen2.5-7B-Instruct',
  'lora-qwen2.5-14b':    'LoRA/Qwen/Qwen2.5-14B-Instruct',
  'lora-qwen2.5-32b':    'LoRA/Qwen/Qwen2.5-32B-Instruct',
  'lora-qwen2.5-72b':    'LoRA/Qwen/Qwen2.5-72B-Instruct',
  'qwen2.5-7b-pro':      'Pro/Qwen/Qwen2.5-7B-Instruct',
  'deepseek-v3-pro':     'Pro/deepseek-ai/DeepSeek-V3.2',
};

// Flat pricing: 1 credit = 1 token across all models.
// $1 = 100K credits. Proxy charges actual prompt+completion tokens.
export const MODEL_PRICING: Record<string, { inputPrice: number; outputPrice: number }> = {
  'deepseek-v4-pro':     { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1':         { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1-pro':     { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-397b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-122b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-72b-128k':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-72b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.6-35b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.6-27b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'kimi-k2.6':           { inputPrice: 1.0, outputPrice: 1.0 },
  'nex-n2-pro':          { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.1':             { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3.1':       { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3.1-pro':   { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-35b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-4-32b':           { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-32b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-32b-t':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-30b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-30b-t':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-8b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-vl-8b-t':       { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-4.5v':            { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-omni-30b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-omni-30b-t':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-32b':           { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-32b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-27b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-14b':           { inputPrice: 1.0, outputPrice: 1.0 },
  'seed-oss-36b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'minimax-m2.5-basic':  { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v4-flash':   { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-5.2':             { inputPrice: 1.0, outputPrice: 1.0 },
  'kimi-k2.7-code':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-coder':         { inputPrice: 1.0, outputPrice: 1.0 },
  'step-3.5-flash':      { inputPrice: 1.0, outputPrice: 1.0 },
  'hunyuan-a13b':        { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-14b':         { inputPrice: 1.0, outputPrice: 1.0 },
  'ling-flash-2.0':      { inputPrice: 1.0, outputPrice: 1.0 },
  'ling-mini-2.0':       { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3-basic':   { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-30b':           { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-r1-8b':      { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-7b':          { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3-8b':            { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-4-9b':            { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-z1-9b':           { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-9b':          { inputPrice: 1.0, outputPrice: 1.0 },
  'glm-4.5-air':         { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen3.5-4b':          { inputPrice: 1.0, outputPrice: 1.0 },
  'longcat-2.0':         { inputPrice: 1.0, outputPrice: 1.0 },
  'lora-qwen2.5-7b':     { inputPrice: 1.0, outputPrice: 1.0 },
  'lora-qwen2.5-14b':    { inputPrice: 1.0, outputPrice: 1.0 },
  'lora-qwen2.5-32b':    { inputPrice: 1.0, outputPrice: 1.0 },
  'lora-qwen2.5-72b':    { inputPrice: 1.0, outputPrice: 1.0 },
  'qwen2.5-7b-pro':      { inputPrice: 1.0, outputPrice: 1.0 },
  'deepseek-v3-pro':     { inputPrice: 1.0, outputPrice: 1.0 },
};

export function getUserFacingModelId(siliconId: string): string | null {
  for (const [friendly, upstream] of Object.entries(MODEL_MAPPING)) {
    if (upstream === siliconId) return friendly
  }
  return null
}

export function getModelPrice(modelId: string) {
  return MODEL_PRICING[modelId] || { inputPrice: 1.0, outputPrice: 1.0 }
}

// System personas — lightweight, no brand impersonation
const MODEL_PERSONAS: Record<string, string> = {}
export function injectPersona(modelId: string, messages: any[]): any[] { return messages }

// Plan-based model access
const ALL = Object.keys(MODEL_MAPPING)
const BUDGET = ['deepseek-v3', 'qwen3.6-27b', 'qwen3-32b', 'qwen3.5-27b', 'minimax-m2.5-basic', 'deepseek-v4-flash', 'glm-5.2', 'ling-mini-2.0', 'deepseek-v3-basic', 'qwen2.5-7b', 'qwen3-8b', 'glm-4-9b', 'glm-4.5-air', 'qwen3.5-4b', 'longcat-2.0']
const MID = ['deepseek-v3', 'qwen3.6-27b', 'qwen3-32b', 'qwen3.5-27b', 'minimax-m2.5-basic', 'deepseek-v4-flash', 'glm-5.2', 'ling-mini-2.0', 'deepseek-v3-basic', 'qwen2.5-7b', 'qwen3-8b', 'glm-4-9b', 'glm-4.5-air', 'qwen3.5-4b', 'longcat-2.0', 'deepseek-v4-pro', 'deepseek-r1', 'qwen3.5-122b', 'qwen3.6-35b', 'glm-5.1', 'deepseek-v3.1', 'qwen3.5-35b', 'glm-4-32b', 'qwen2.5-32b', 'qwen3-14b', 'step-3.5-flash', 'hunyuan-a13b', 'qwen2.5-14b', 'ling-flash-2.0', 'qwen3-30b', 'deepseek-r1-8b', 'glm-z1-9b', 'qwen3.5-9b', 'qwen2.5-7b-pro', 'deepseek-v3-pro']
const PRO = ['deepseek-v3', 'qwen3.6-27b', 'qwen3-32b', 'qwen3.5-27b', 'minimax-m2.5-basic', 'deepseek-v4-flash', 'glm-5.2', 'ling-mini-2.0', 'deepseek-v3-basic', 'qwen2.5-7b', 'qwen3-8b', 'glm-4-9b', 'glm-4.5-air', 'qwen3.5-4b', 'longcat-2.0', 'deepseek-v4-pro', 'deepseek-r1', 'qwen3.5-122b', 'qwen3.6-35b', 'glm-5.1', 'deepseek-v3.1', 'qwen3.5-35b', 'glm-4-32b', 'qwen2.5-32b', 'qwen3-14b', 'step-3.5-flash', 'hunyuan-a13b', 'qwen2.5-14b', 'ling-flash-2.0', 'qwen3-30b', 'deepseek-r1-8b', 'glm-z1-9b', 'qwen3.5-9b', 'qwen2.5-7b-pro', 'deepseek-v3-pro', 'deepseek-r1-pro', 'qwen3.5-397b', 'qwen2.5-72b-128k', 'qwen2.5-72b', 'kimi-k2.6', 'nex-n2-pro', 'deepseek-v3.1-pro', 'qwen3-vl-32b', 'qwen3-vl-32b-t', 'qwen3-vl-30b', 'qwen3-vl-30b-t', 'qwen3-vl-8b', 'qwen3-vl-8b-t', 'glm-4.5v', 'qwen3-omni-30b', 'qwen3-omni-30b-t', 'seed-oss-36b', 'kimi-k2.7-code', 'qwen3-coder', 'lora-qwen2.5-7b', 'lora-qwen2.5-14b', 'lora-qwen2.5-32b', 'lora-qwen2.5-72b']

export const PLAN_ACCESS: Record<string, string[]> = {
  'Free':       BUDGET,
  'Basic':      MID,
  'Pro':        PRO,
  'Enterprise': ALL,
  'Unlimited':  ALL,
};

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