// 品牌名称映射：真实模型ID → 展示品牌名
// 用户在界面上看到的是品牌名，调用API时用真实ID

export const MODEL_BRAND_NAMES: Record<string, string> = {
  // DeepSeek 系列
  'deepseek-ai/DeepSeek-V4-Pro': 'LLM-Pro-V4',
  'deepseek-ai/DeepSeek-V4-Flash': 'LLM-Flash-V4',
  'deepseek-ai/DeepSeek-V3.2': 'LLM-Pro-V3',
  'deepseek-ai/DeepSeek-V3.1-Terminus': 'LLM-Terminal',
  'deepseek-ai/DeepSeek-R1': 'LLM-Reason-R1',
  'deepseek-ai/DeepSeek-V3': 'LLM-Core-V3',
  'deepseek-ai/DeepSeek-OCR': 'OCR-Omni',

  // Qwen 系列
  'Qwen/Qwen3.6-35B-A3B': 'LLM-Ultra-35B',
  'Qwen/Qwen3.6-27B': 'LLM-Core-27B',
  'Qwen/Qwen3.5-397B-A17B': 'LLM-Max-397B',
  'Qwen/Qwen3.5-122B-A10B': 'LLM-Max-122B',
  'Qwen/Qwen3.5-35B-A3B': 'LLM-Ultra-35B',
  'Qwen/Qwen3.5-27B': 'LLM-Core-27B',
  'Qwen/Qwen3.5-9B': 'LLM-Lite-9B',
  'Qwen/Qwen3.5-4B': 'LLM-Micro-4B',
  'Qwen/Qwen3-32B': 'LLM-Think-32B',
  'Qwen/Qwen3-14B': 'LLM-Think-14B',
  'Qwen/Qwen3-8B': 'LLM-Think-8B',
  'Qwen/Qwen3-30B-A3B-Instruct-2507': 'LLM-Ultra-30B',
  'Qwen/Qwen3-Coder-30B-A3B-Instruct': 'LLM-Code-30B',
  'Qwen/QwQ-32B': 'LLM-Reason-32B',
  'Qwen/Qwen2.5-72B-Instruct-128K': 'LLM-Extended-72B',
  'Qwen/Qwen2.5-72B-Instruct': 'LLM-Pro-72B',
  'Qwen/Qwen2.5-32B-Instruct': 'LLM-Pro-32B',
  'Qwen/Qwen2.5-14B-Instruct': 'LLM-Pro-14B',
  'Qwen/Qwen2.5-7B-Instruct': 'LLM-Pro-7B',
  'Qwen/Qwen3-VL-32B-Instruct': 'LLM-Vision-32B',
  'Qwen/Qwen3-VL-32B-Thinking': 'LLM-Vision-32B-Think',
  'Qwen/Qwen3-VL-8B-Instruct': 'LLM-Vision-8B',
  'Qwen/Qwen3-VL-8B-Thinking': 'LLM-Vision-8B-Think',
  'Qwen/Qwen3-VL-30B-A3B-Instruct': 'LLM-Vision-30B',
  'Qwen/Qwen3-VL-30B-A3B-Thinking': 'LLM-Vision-30B-Think',
  'Qwen/Qwen3-Omni-30B-A3B-Instruct': 'LLM-Omni-30B',
  'Qwen/Qwen3-Omni-30B-A3B-Thinking': 'LLM-Omni-30B-Think',
  'Qwen/Qwen3-Omni-30B-A3B-Captioner': 'LLM-Caption-30B',
  'Qwen/Qwen3-VL-Embedding-8B': 'Embed-VL-8B',
  'Qwen/Qwen3-VL-Reranker-8B': 'Rerank-VL-8B',
  'Qwen/Qwen3-Embedding-8B': 'Embed-Text-8B',
  'Qwen/Qwen3-Reranker-8B': 'Rerank-8B',
  'Qwen/Qwen3-Embedding-4B': 'Embed-Text-4B',
  'Qwen/Qwen3-Reranker-4B': 'Rerank-4B',
  'Qwen/Qwen3-Embedding-0.6B': 'Embed-Text-Micro',
  'Qwen/Qwen3-Reranker-0.6B': 'Rerank-Micro',
  'Qwen/Qwen-Image-Edit-2509': 'Image-Edit-Pro',
  'Qwen/Qwen-Image-Edit': 'Image-Edit',
  'Qwen/Qwen-Image': 'Image-Gen',

  // LoRA 系列
  'LoRA/Qwen/Qwen2.5-32B-Instruct': 'LLM-LoRA-32B',
  'LoRA/Qwen/Qwen2.5-14B-Instruct': 'LLM-LoRA-14B',
  'LoRA/Qwen/Qwen2.5-72B-Instruct': 'LLM-LoRA-72B',
  'LoRA/Qwen/Qwen2.5-7B-Instruct': 'LLM-LoRA-7B',

  // Pro 系列 (综合供应商)
  'Pro/moonshotai/Kimi-K2.6': 'LLM-K2-Pro',
  'Pro/moonshotai/Kimi-K2.5': 'LLM-K2',
  'Pro/zai-org/GLM-5.1': 'LLM-GLM-5.1',
  'Pro/zai-org/GLM-5': 'LLM-GLM-5',
  'Pro/zai-org/GLM-4.7': 'LLM-GLM-4.7',
  'Pro/MiniMaxAI/MiniMax-M2.5': 'LLM-MiniMax-M2.5',
  'Pro/BAAI/bge-m3': 'Embed-BGE-M3',
  'Pro/deepseek-ai/DeepSeek-V3.2': 'LLM-Pro-V3',
  'Pro/deepseek-ai/DeepSeek-V3.1-Terminus': 'LLM-Terminal',
  'Pro/deepseek-ai/DeepSeek-R1': 'LLM-Reason-R1',
  'Pro/deepseek-ai/DeepSeek-V3': 'LLM-Core-V3',
  'Pro/Qwen/Qwen2.5-7B-Instruct': 'LLM-Qwen-7B',

  // GLM / THUDM 系列
  'THUDM/GLM-4-32B-0414': 'LLM-GLM-32B',
  'THUDM/GLM-Z1-9B-0414': 'LLM-GLM-Z1',
  'THUDM/GLM-4-9B-0414': 'LLM-GLM-9B',

  // zai-org 系列
  'zai-org/GLM-4.5V': 'LLM-Vision-GLM',
  'zai-org/GLM-4.5-Air': 'LLM-GLM-Air',

  // BAAI 系列
  'BAAI/bge-large-en-v1.5': 'Embed-BGE-EN',
  'BAAI/bge-large-zh-v1.5': 'Embed-BGE-ZH',
  'BAAI/bge-reranker-v2-m3': 'Rerank-BGE-M3',

  // MiniMax
  'MiniMaxAI/MiniMax-M2.5': 'LLM-MiniMax-M2.5',

  // StepFun
  'stepfun-ai/Step-3.5-Flash': 'LLM-Step-Flash',

  // inclusionAI
  'inclusionAI/Ling-flash-2.0': 'LLM-Ling-Flash',
  'inclusionAI/Ling-mini-2.0': 'LLM-Ling-Mini',

  // Nex-AGI
  'nex-agi/Nex-N2-Pro': 'LLM-Nex-Pro',

  // Tencent
  'tencent/Hunyuan-MT-7B': 'LLM-Hunyuan-MT',
  'tencent/Hunyuan-A13B-Instruct': 'LLM-Hunyuan-13B',

  // ByteDance
  'ByteDance-Seed/Seed-OSS-36B-Instruct': 'LLM-Seed-36B',

  // Wan-AI
  'Wan-AI/Wan2.2-I2V-A14B': 'Video-I2V-14B',
  'Wan-AI/Wan2.2-T2V-A14B': 'Video-T2V-14B',

  // Tongyi-MAI
  'Tongyi-MAI/Z-Image-Turbo': 'Image-Gen-Turbo',
  'Tongyi-MAI/Z-Image': 'Image-Gen-Standard',

  // Baidu
  'baidu/ERNIE-Image-Turbo': 'Image-ERNIE-Turbo',

  // Kwai-Kolors
  'Kwai-Kolors/Kolors': 'Image-Kolors',

  // Netease
  'netease-youdao/bce-embedding-base_v1': 'Embed-BCE',
  'netease-youdao/bce-reranker-base_v1': 'Rerank-BCE',

  // FunAudioLLM
  'FunAudioLLM/CosyVoice2-0.5B': 'Voice-Cosy-0.5B',
  'FunAudioLLM/SenseVoiceSmall': 'Voice-Sense-Small',

  // PaddlePaddle
  'PaddlePaddle/PaddleOCR-VL-1.5': 'OCR-VL-Paddle',

  // TeleAI
  'TeleAI/TeleSpeechASR': 'Voice-ASR-Tele',

  // fnlp
  'fnlp/MOSS-TTSD-v0.5': 'Voice-MOSS-TTS',
}

// 从真实ID获取品牌名（未知模型自动生成）
export function getBrandName(modelId: string): string {
  if (MODEL_BRAND_NAMES[modelId]) return MODEL_BRAND_NAMES[modelId]

  // 自动生成品牌名
  const parts = modelId.split('/')
  const name = parts[parts.length - 1] || modelId
  const clean = name.replace(/[_\-\.]/g, ' ')
    .replace(/\d+[kKbB]/g, m => m.toUpperCase())
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')

  return `LLM-${clean}`
}

// 从品牌名反查真实ID（用于API调用）
export const BRAND_TO_REAL: Record<string, string> = Object.fromEntries(
  Object.entries(MODEL_BRAND_NAMES).map(([real, brand]) => [brand, real])
)

// 类别品牌名（给 Playground 分类展示用）
export const CATEGORY_BRANDS: Record<string, string> = {
  'Text Generation': 'Text Models',
  'Coding': 'Code Models',
  'Embeddings': 'Embedding Models',
  'Image Generation': 'Image Models',
  'Text-to-Speech': 'Voice Models',
  'Speech Recognition': 'ASR Models',
}