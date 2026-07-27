import type { Metadata } from 'next'

const SITE_URL = 'https://llmrpc.com'

export const metadata: Metadata = {
  title: 'AI Models — LLMRpc',
  description: 'Browse 27+ AI models available through LLMRpc API. DeepSeek, Qwen, GLM, Claude, Gemini, GPT and more. Filter by provider, category, and pricing.',
  alternates: {
    canonical: `${SITE_URL}/models`,
  },
  openGraph: {
    title: 'AI Models — LLMRpc',
    description: 'Browse 27+ AI models available through LLMRpc API.',
    url: `${SITE_URL}/models`,
  },
}

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
