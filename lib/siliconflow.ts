import axios from 'axios'

const siliconflow = axios.create({
  baseURL: process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1',
  headers: {
    'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  contextLen: number
  inputPrice: number
  outputPrice: number
  modalities: string[]
  category: string
}

const PROVIDER_MAP: Record<string, string> = {
  'qwen': 'Qwen', 'deepseek-ai': 'DeepSeek', 'thudm': 'GLM',
  'internlm': 'InternLM', 'mistralai': 'Mistral', 'anthropic': 'Anthropic',
  'openai': 'OpenAI', 'google': 'Google', 'stabilityai': 'StabilityAI',
  'bytedance': 'ByteDance', 'baai': 'BAAI',
}

let modelsCache: ModelInfo[] | null = null
let modelsCacheTime = 0
const CACHE_TTL = 3600000

export async function getModels(): Promise<ModelInfo[]> {
  if (modelsCache && Date.now() - modelsCacheTime < CACHE_TTL) return modelsCache
  try {
    const res = await siliconflow.get('/models')
    const models: ModelInfo[] = (res.data?.data || []).map((m: any) => {
      const parts = m.id.split('/')
      const provider = parts[0] || 'unknown'
      const modelName = parts[1] || m.id
      const providerName = PROVIDER_MAP[provider] || provider
      let category = 'Text Generation'
      const ml = m.id.toLowerCase()
      if (ml.includes('coder') || ml.includes('code')) category = 'Coding'
      else if (ml.includes('embed')) category = 'Embeddings'
      else if (ml.includes('sdxl') || ml.includes('stable-diffusion')) category = 'Image Generation'
      const ctxMatch = ml.match(/(\d+)k/)
      const contextLen = ctxMatch ? parseInt(ctxMatch[1]) * 1024 : 32768
      return { id: m.id, name: modelName.replace(/_/g, ' ').replace(/-/g, ' '), provider: providerName, description: m.id, contextLen, inputPrice: 0.5, outputPrice: 1.0, modalities: ['text'], category }
    })
    modelsCache = models
    modelsCacheTime = Date.now()
    return models
  } catch (err) {
    console.error('SiliconFlow fetch error:', err)
    return modelsCache || []
  }
}

export async function proxyRequest(modelId: string, payload: any) {
  const res = await siliconflow.post('/chat/completions', { ...payload, model: modelId })
  return res.data
}

export { siliconflow }
