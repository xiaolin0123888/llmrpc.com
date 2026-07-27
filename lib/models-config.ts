// ============================================================
// 模型配置：映射、定价、套餐权限
// ============================================================

// ── 汇率常量 ──
/** $1 = 100,000 credits */
export const CREDITS_PER_DOLLAR = 100_000

/** 给定 $/M tokens 价格，返回每个 token 花费的 credits */
export function tokenPriceInCredits(pricePerMillionTokens: number): number {
  // pricePerMillionTokens USD per 1M tokens
  // → credits per token = pricePerMillionTokens * CREDITS_PER_DOLLAR / 1_000_000
  return pricePerMillionTokens * CREDITS_PER_DOLLAR / 1_000_000
}

// ── 模型映射：对外短名 → SiliconFlow 真实ID ──
// 注意：短名采用 OpenRouter 兼容格式 provider/model-name
export const MODEL_MAPPING: Record<string, string> = {
  // DeepSeek
  'deepseek/deepseek-v4-pro':    'deepseek-ai/DeepSeek-V3',     // 镜像到最新V3
  'deepseek/deepseek-v4-flash':  'Pro/zai-org/DeepSeek-V3-0324',  // ⚠️ fast model
  'deepseek/deepseek-r1':        'deepseek-ai/DeepSeek-R1',
  'deepseek/deepseek-r1-distill-qwen-32b': 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',

  // Qwen
  'qwen/qwen3-235b-a22b': 'Qwen/Qwen3-235B-A22B',
  'qwen/qwen3-72b':        'Qwen/Qwen3-72B',
  'qwen/qwq-32b':          'Qwen/QwQ-32B',
  'qwen/qwen2.5-72b':      'Qwen/Qwen2.5-72B-Instruct',
  'qwen/qwen2.5-32b':      'Qwen/Qwen2.5-32B-Instruct',
  'qwen/qwen2.5-14b':      'Qwen/Qwen2.5-14B-Instruct',
  'qwen/qwen2.5-7b':       'Qwen/Qwen2.5-7B-Instruct',
  'qwen/qwen-turbo':       'Qwen/Qwen-Turbo',

  // GLM / Zhipu
  'zhipu/glm-4-32b':       'THUDM/GLM-4-32B-0414',
  'zhipu/glm-4-9b':        'THUDM/GLM-4-9B-0414',
  'zhipu/glm-5.2':         'Pro/zai-org/GLM-4-32B-0414',  // mirror for v5
  'zhipu/glm-4v':          'THUDM/GLM-4V-0414',

  // OpenAI (via SiliconFlow)
  'openai/gpt-4o':         'Pro/OpenAI-GPT-4o',
  'openai/gpt-4o-mini':    'Pro/OpenAI-GPT-4o-mini',

  // Anthropic (via SiliconFlow)
  'anthropic/claude-sonnet-4.7':  'Pro/Anthropic-Claude-Sonnet-4.7',
  'anthropic/claude-sonnet-4.6':  'Pro/Anthropic-Claude-Sonnet-4.6',
  'anthropic/claude-haiku-4.5':   'Pro/Anthropic-Claude-Haiku-4.5',

  // Google (via SiliconFlow)
  'google/gemini-2.5-pro':   'Pro/Google-Gemini-2.5-Pro',
  'google/gemini-2.5-flash': 'Pro/Google-Gemini-2.5-Flash',

  // Mistral
  'mistral/mistral-medium-3.5': 'Pro/mistralai-Mistral-Medium-3.5',
  'mistral/mistral-small-4':    'Pro/mistralai-Mistral-Small-4',
  'mistral/codestral':          'Pro/mistralai-codestral',

  // Yi (01.AI)
  '01-ai/yi-lightning': '01-ai/Yi-Lightning',
  '01-ai/yi-large':     '01-ai/Yi-Large',

  // InternLM
  'internlm/internlm3-8b':  'internlm/internlm3-8b-instruct',
  'internlm/internlm2_5-7b': 'internlm/internlm2_5-7b-chat',
}

// ── 模型定价表 ($/百万 token) ──
// 输入价格、输出价格分别标注
export interface ModelPricing {
  inputPrice: number    // USD per 1M input tokens
  outputPrice: number   // USD per 1M output tokens
  discount?: string     // 折扣说明
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // DeepSeek
  'deepseek/deepseek-v4-pro':            { inputPrice: 1.25, outputPrice: 2.50 },
  'deepseek/deepseek-v4-flash':          { inputPrice: 0.14, outputPrice: 0.28 },
  'deepseek/deepseek-r1':                { inputPrice: 0.55, outputPrice: 2.19 },
  'deepseek/deepseek-r1-distill-qwen-32b': { inputPrice: 0.25, outputPrice: 0.50 },

  // Qwen
  'qwen/qwen3-235b-a22b':  { inputPrice: 0.50, outputPrice: 1.00 },
  'qwen/qwen3-72b':        { inputPrice: 0.40, outputPrice: 0.80 },
  'qwen/qwq-32b':          { inputPrice: 0.35, outputPrice: 0.70 },
  'qwen/qwen2.5-72b':      { inputPrice: 0.35, outputPrice: 0.70 },
  'qwen/qwen2.5-32b':      { inputPrice: 0.20, outputPrice: 0.40 },
  'qwen/qwen2.5-14b':      { inputPrice: 0.10, outputPrice: 0.20 },
  'qwen/qwen2.5-7b':       { inputPrice: 0.06, outputPrice: 0.12 },
  'qwen/qwen-turbo':       { inputPrice: 0.10, outputPrice: 0.20 },

  // GLM
  'zhipu/glm-4-32b':       { inputPrice: 0.42, outputPrice: 0.84 },
  'zhipu/glm-4-9b':        { inputPrice: 0.10, outputPrice: 0.20 },
  'zhipu/glm-5.2':         { inputPrice: 0.42, outputPrice: 0.84 },
  'zhipu/glm-4v':          { inputPrice: 0.50, outputPrice: 1.00 },

  // OpenAI
  'openai/gpt-4o':         { inputPrice: 2.50, outputPrice: 10.00 },
  'openai/gpt-4o-mini':    { inputPrice: 0.15, outputPrice: 0.60 },

  // Anthropic
  'anthropic/claude-sonnet-4.7':  { inputPrice: 3.00, outputPrice: 15.00 },
  'anthropic/claude-sonnet-4.6':  { inputPrice: 3.00, outputPrice: 15.00 },
  'anthropic/claude-haiku-4.5':   { inputPrice: 0.80, outputPrice: 4.00 },

  // Google
  'google/gemini-2.5-pro':   { inputPrice: 1.25, outputPrice: 5.00 },
  'google/gemini-2.5-flash': { inputPrice: 0.15, outputPrice: 0.60 },

  // Mistral
  'mistral/mistral-medium-3.5': { inputPrice: 2.00, outputPrice: 6.00 },
  'mistral/mistral-small-4':    { inputPrice: 0.20, outputPrice: 0.60 },
  'mistral/codestral':          { inputPrice: 0.20, outputPrice: 0.60 },

  // Yi
  '01-ai/yi-lightning': { inputPrice: 0.10, outputPrice: 0.30 },
  '01-ai/yi-large':     { inputPrice: 0.50, outputPrice: 1.50 },

  // InternLM
  'internlm/internlm3-8b':   { inputPrice: 0.06, outputPrice: 0.12 },
  'internlm/internlm2_5-7b': { inputPrice: 0.05, outputPrice: 0.10 },
}

// ── 套餐模型权限 ──
// Free: 入门模型 (3个)
// Basic: + 更多开源模型 (13个)
// Pro: + 高端开源模型 (20个)
// Enterprise: + 商业模型 (25个)
// Unlimited: 全部 (27个)
export const PLAN_ACCESS: Record<string, string[]> = {
  'Free': [
    'deepseek/deepseek-v4-flash',
    'qwen/qwen2.5-7b',
    'internlm/internlm2_5-7b',
  ],
  'Basic': [
    'deepseek/deepseek-v4-flash',
    'deepseek/deepseek-v3',  // 保留旧名兼容
    'deepseek/deepseek-r1-distill-qwen-32b',
    'qwen/qwen2.5-7b',
    'qwen/qwen2.5-14b',
    'qwen/qwen2.5-32b',
    'qwen/qwen2.5-72b',
    'qwen/qwen-turbo',
    'qwen/qwq-32b',
    'zhipu/glm-4-9b',
    'internlm/internlm3-8b',
    'internlm/internlm2_5-7b',
    '01-ai/yi-lightning',
  ],
  'Pro': [
    'deepseek/deepseek-v4-pro',
    'deepseek/deepseek-v4-flash',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-distill-qwen-32b',
    'qwen/qwen3-72b',
    'qwen/qwq-32b',
    'qwen/qwen2.5-72b',
    'qwen/qwen2.5-32b',
    'qwen/qwen2.5-14b',
    'qwen/qwen2.5-7b',
    'qwen/qwen-turbo',
    'zhipu/glm-4-32b',
    'zhipu/glm-4-9b',
    'zhipu/glm-4v',
    'mistral/mistral-small-4',
    'mistral/codestral',
    '01-ai/yi-lightning',
    '01-ai/yi-large',
    'internlm/internlm3-8b',
    'internlm/internlm2_5-7b',
  ],
  'Enterprise': [
    'deepseek/deepseek-v4-pro',
    'deepseek/deepseek-v4-flash',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-distill-qwen-32b',
    'qwen/qwen3-235b-a22b',
    'qwen/qwen3-72b',
    'qwen/qwq-32b',
    'qwen/qwen2.5-72b',
    'qwen/qwen2.5-32b',
    'qwen/qwen2.5-14b',
    'qwen/qwen2.5-7b',
    'qwen/qwen-turbo',
    'zhipu/glm-4-32b',
    'zhipu/glm-5.2',
    'zhipu/glm-4-9b',
    'zhipu/glm-4v',
    'openai/gpt-4o-mini',
    'anthropic/claude-haiku-4.5',
    'google/gemini-2.5-flash',
    'mistral/mistral-medium-3.5',
    'mistral/mistral-small-4',
    'mistral/codestral',
    '01-ai/yi-lightning',
    '01-ai/yi-large',
    'internlm/internlm3-8b',
  ],
  'Unlimited': Object.keys(MODEL_MAPPING),
}

// ── 别名：兼容旧模型名（逐步废弃） ──
export const MODEL_ALIASES: Record<string, string> = {
  // 旧名 → 新名
  'deepseek-v3':                    'deepseek/deepseek-v4-pro',
  'deepseek-r2':                    'deepseek/deepseek-r1',
  'qwen3':                          'qwen/qwen3-72b',
  'qwen2.5-72b':                    'qwen/qwen2.5-72b',
  'qwq-32b':                        'qwen/qwq-32b',
  'glm-5':                          'zhipu/glm-4-32b',
  'glm-5.1-highspeed':              'zhipu/glm-4-9b',
  'gpt-4o':                         'openai/gpt-4o',
  'gpt-4o-mini':                    'openai/gpt-4o-mini',
  'gpt-4-turbo':                    'openai/gpt-4o-mini',   // deprecated, map to mini
  'gpt-3.5-turbo':                  'qwen/qwen-turbo',      // deprecated, map to qwen-turbo
  'claude-opus-4.7':                'anthropic/claude-sonnet-4.7',
  'claude-sonnet-4.6':              'anthropic/claude-sonnet-4.6',
  'claude-haiku-4.5':               'anthropic/claude-haiku-4.5',
  'gemini-3.5':                     'google/gemini-2.5-flash',
  'gemini-2.5-pro':                 'google/gemini-2.5-pro',
  'gemini-2.5-flash':               'google/gemini-2.5-flash',
  'mistral-medium-3.5':             'mistral/mistral-medium-3.5',
  'mistral-small-4':                'mistral/mistral-small-4',
  'codestral':                      'mistral/codestral',
  'yi-lightning':                   '01-ai/yi-lightning',
  'yi-large':                       '01-ai/yi-large',
}

// ── 所有套餐等级 ──
export const PLAN_TIERS = ['Free', 'Basic', 'Pro', 'Enterprise', 'Unlimited'] as const
export type PlanTier = typeof PLAN_TIERS[number]

// ── 辅助函数 ──

/**
 * 解析模型名：先查别名表，再查映射表，最后原样返回
 */
export function resolveModelId(requestedId: string): string {
  // Step 1: Check aliases (old name → new name)
  const aliasTarget = MODEL_ALIASES[requestedId]
  if (aliasTarget) return aliasTarget

  // Step 2: Already a valid short name
  if (MODEL_MAPPING[requestedId]) return requestedId

  // Step 3: Try to match as SiliconFlow raw ID (reverse lookup)
  const lower = requestedId.toLowerCase()
  for (const [short, real] of Object.entries(MODEL_MAPPING)) {
    if (real.toLowerCase() === lower) return short
  }

  // Step 4: Unknown → return as-is, will be rejected by access check
  return requestedId
}

/**
 * 获取模型对应的 SiliconFlow 真实 ID
 */
export function getSiliconFlowModelId(shortName: string): string | undefined {
  return MODEL_MAPPING[shortName]
}

/**
 * 检查用户是否可以使用指定模型
 */
export function canUserAccessModel(userPlanName: string, requestedModelId: string): boolean {
  const normalizedPlan = normalizePlanName(userPlanName)
  if (normalizedPlan === 'Unlimited') return true

  const resolved = resolveModelId(requestedModelId)

  // Check if model is in any plan (i.e., is it a supported model at all)
  const allSupported = new Set(Object.values(PLAN_ACCESS).flat())
  if (!allSupported.has(resolved)) return false

  // Check plan access
  const allowed = PLAN_ACCESS[normalizedPlan] || []
  return allowed.includes(resolved)
}

/**
 * 获取用户在当前套餐下可访问的短名列表
 */
export function getUserAccessibleShortNames(userPlanName: string): string[] {
  const normalizedPlan = normalizePlanName(userPlanName)
  if (normalizedPlan === 'Unlimited') {
    return Object.keys(MODEL_MAPPING)
  }
  const planIndex = PLAN_TIERS.indexOf(normalizedPlan)
  if (planIndex < 0) return PLAN_ACCESS['Free'] || []

  const allowed = new Set<string>()
  for (let i = 0; i <= planIndex; i++) {
    const tier = PLAN_TIERS[i]
    for (const m of PLAN_ACCESS[tier] || []) allowed.add(m)
  }
  return [...allowed]
}

/**
 * 归一化套餐名
 */
export function normalizePlanName(name: string): PlanTier {
  const upper = name.toUpperCase()
  switch (upper) {
    case 'FREE': return 'Free'
    case 'BASIC': return 'Basic'
    case 'PRO': return 'Pro'
    case 'ENTERPRISE': return 'Enterprise'
    case 'UNLIMITED': return 'Unlimited'
    default: return 'Free'
  }
}

/**
 * 计算请求的 credits 消耗
 * @param promptTokens 输入 tokens
 * @param completionTokens 输出 tokens
 * @param modelShortName 模型短名
 * @returns 消耗的 credits 数
 */
export function calculateCreditCost(
  promptTokens: number,
  completionTokens: number,
  modelShortName: string,
): number {
  const pricing = MODEL_PRICING[modelShortName]
  if (!pricing) {
    // Unknown model — fallback to conservative pricing ($1/M tokens = 100 credits/1K)
    const totalTokens = promptTokens + completionTokens
    return Math.ceil(totalTokens * tokenPriceInCredits(1.0))
  }

  const inputCredits = promptTokens * tokenPriceInCredits(pricing.inputPrice)
  const outputCredits = completionTokens * tokenPriceInCredits(pricing.outputPrice)

  // 至少收 1 credit
  return Math.max(1, Math.ceil(inputCredits + outputCredits))
}

// ── 旧 API 兼容 ──

/**
 * getModelPrice — 获取模型定价（兼容旧 API）
 */
export function getModelPrice(shortName: string): ModelPricing {
  return MODEL_PRICING[shortName] || { inputPrice: 1.0, outputPrice: 2.0 }
}

/**
 * getUserFacingModelId — 将 SiliconFlow 真实ID 反查为短名
 */
export function getUserFacingModelId(realModelId: string): string | undefined {
  const lower = realModelId.toLowerCase()
  for (const [short, real] of Object.entries(MODEL_MAPPING)) {
    if (real.toLowerCase() === lower) return short
  }
  return undefined
}

// 保留旧函数签名（deprecated）
export function styleModelFilter(_showModel: string, content: string): string {
  return content
}
export function checkAntiSpider(userAgent: string): boolean {
  const spiderKeywords = ['python-requests', 'curl', 'wget', 'scrapy', 'java/', 'go-http', 'ruby', 'php']
  const ua = userAgent.toLowerCase()
  return spiderKeywords.some(k => ua.includes(k))
}
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
export async function getUserPlanInfo(userId: string, db: { getOne: Function }) {
  const sub = await db.getOne(
    'SELECT plan FROM subscriptions WHERE user_id = $1 AND status = $2 LIMIT 1',
    [userId, 'ACTIVE']
  )
  return sub?.plan ?? 'Free'
}
