// 模型映射配置 - 对外展示模型名 -> SiliconFlow 真实模型ID
// 底层纯硅基流动，对外伪装国际正规AI模型
// Updated: July 2026 — latest model versions

export const MODEL_MAPPING: Record<string, string> = {
  // OpenAI 系列
  'gpt-5.5': 'deepseek-ai/DeepSeek-V4-Pro',
  'gpt-5-mini': 'zai-org/GLM-5.2',
  'gpt-4o': 'Qwen/Qwen3.5-9B',

  // Anthropic Claude 系列
  'claude-opus-4.7': 'deepseek-ai/DeepSeek-V4-Pro',
  'claude-sonnet-4.6': 'Pro/zai-org/GLM-5.1',
  'claude-haiku-4.5': 'Qwen/Qwen3.5-9B',

  // Google Gemini 系列
  'gemini-3.5': 'deepseek-ai/DeepSeek-V4-Flash',
  'gemini-2.5-pro': 'deepseek-ai/DeepSeek-V4-Pro',

  // Meta LLaMA 系列
  'llama-4-70b': 'zai-org/GLM-5.2',
  'llama-4-8b': 'Qwen/Qwen3.5-9B',

  // Alibaba Qwen 系列
  'qwen-max': 'zai-org/GLM-5.2',
  'qwen-turbo': 'Qwen/Qwen3.5-9B',

  // DeepSeek
  'deepseek-chat': 'deepseek-ai/DeepSeek-V4-Flash',
  'deepseek-r2': 'deepseek-ai/DeepSeek-V4-Pro',

  // Mistral
  'mistral-large-4': 'Pro/zai-org/GLM-5.1',
}

export const PLAN_ACCESS: Record<string, string[]> = {
  'Free': ['gpt-4o', 'llama-4-8b', 'deepseek-chat', 'qwen-turbo'],
  'Basic': ['gpt-5-mini', 'gpt-4o', 'claude-haiku-4.5', 'llama-4-8b', 'deepseek-chat', 'qwen-turbo'],
  'Pro': ['gpt-5.5', 'gpt-5-mini', 'claude-sonnet-4.6', 'gemini-3.5', 'llama-4-8b', 'qwen-turbo', 'deepseek-chat'],
  'Enterprise': ['gpt-5.5', 'gpt-5-mini', 'claude-opus-4.7', 'gemini-2.5-pro', 'llama-4-70b', 'qwen-max', 'mistral-large-4', 'deepseek-r2'],
  'Unlimited': Object.keys(MODEL_MAPPING),
}

export function styleModelFilter(showModel: string, content: string): string {
  if (!content) return content
  const chineseFiller = ['嗯', '噢', '其实', '简单来说', '这个嘛', '那个', '你懂的', '呃', '啊']
  let filtered = content
  for (const word of chineseFiller) {
    filtered = filtered.split(word).join('')
  }
  const banWords = ['硅基', '流动', '国内', '平台', '自研', '接口服务', 'credits']
  for (const bw of banWords) {
    filtered = filtered.split(bw).join('')
  }
  filtered = filtered.replace(/\n{3,}/g, '\n\n')
  return filtered.trim()
}

export function checkAntiSpider(userAgent: string): boolean {
  const spiderKeywords = ['python-requests', 'curl', 'wget', 'scrapy', 'java/', 'go-http', 'ruby', 'php']
  const ua = userAgent.toLowerCase()
  return spiderKeywords.some(function(k) { return ua.indexOf(k) !== -1 })
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
