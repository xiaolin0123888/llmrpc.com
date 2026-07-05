import Link from 'next/link'

const MODELS = [
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'Anthropic', desc: 'Anthropic most capable model. Frontier intelligence, complex coding.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'Anthropic', desc: 'Best balance of speed and capability. Enterprise-grade reasoning.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-haiku-4.7', name: 'Claude Haiku 4.7', provider: 'Anthropic', desc: 'Ultra-fast and affordable. Ideal for high-volume production.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'gpt-6', name: 'GPT-6', provider: 'OpenAI', desc: 'OpenAI latest frontier model. Cutting-edge reasoning and analysis.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-5.5-turbo', name: 'GPT-5.5 Turbo', provider: 'OpenAI', desc: 'Optimized for speed. High-throughput, low-latency production.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-4.7', name: 'GPT-4.7', provider: 'OpenAI', desc: 'Reliable multimodal model. Vision, audio, text understanding.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gemini-4', name: 'Gemini 4', provider: 'Google', desc: 'Google latest generation. Agentic, multimodal, 2M context.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-3.5-pro', name: 'Gemini 3.5 Pro', provider: 'Google', desc: 'Pro reasoning with 1M context window.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Google', desc: 'Speed-optimized. High-frequency inference.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'deepseek-v5', name: 'DeepSeek V5', provider: 'DeepSeek', desc: 'Latest MoE architecture. Frontier performance, 1M context.', color: '#231f20', bg: '#f9f9f9' },
  { id: 'deepseek-r3', name: 'DeepSeek R3', provider: 'DeepSeek', desc: 'Advanced reasoning model. Extended context.', color: '#231f20', bg: '#f9f9f9' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', desc: 'Fast and cost-efficient. Great for everyday tasks.', color: '#231f20', bg: '#f9f9f9' },
  { id: 'qwen4', name: 'Qwen4', provider: 'Alibaba', desc: 'Alibaba latest flagship. Multilingual, long context.', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwen3-max', name: 'Qwen3 Max', provider: 'Alibaba', desc: 'Large MoE model. Best-in-class for complex reasoning.', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwen3-turbo', name: 'Qwen3 Turbo', provider: 'Alibaba', desc: 'Speed-optimized. High-throughput production.', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwq-32b', name: 'QwQ-32B', provider: 'Alibaba', desc: 'Reasoning-focused. Math and coding specialist.', color: '#e05400', bg: '#fff7ed' },
  { id: 'glm-6', name: 'GLM-6', provider: 'Zhipu', desc: 'Zhipu new frontier model. Strong reasoning and agentic.', color: '#6b21a8', bg: '#faf5ff' },
  { id: 'glm-5.5', name: 'GLM-5.5', provider: 'Zhipu', desc: 'Balanced performance. General purpose, 128K context.', color: '#6b21a8', bg: '#faf5ff' },
  { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'Mistral', desc: 'Mistral flagship. Function calling, multilingual.', color: '#b45309', bg: '#fff7ed' },
  { id: 'mistral-small-4', name: 'Mistral Small 4', provider: 'Mistral', desc: 'Compact and efficient. Lightweight tasks.', color: '#b45309', bg: '#fff7ed' },
  { id: 'codestral-2', name: 'Codestral 2', provider: 'Mistral', desc: 'Coding-specialized. Code generation expert.', color: '#b45309', bg: '#fff7ed' },
  { id: 'llama-5-70b', name: 'LLaMA 5 70B', provider: 'Meta', desc: 'Meta latest open-source flagship. 70B parameters.', color: '#dc2626', bg: '#fef2f2' },
  { id: 'llama-5-8b', name: 'LLaMA 5 8B', provider: 'Meta', desc: 'Efficient open-source. Fast inference.', color: '#dc2626', bg: '#fef2f2' },
  { id: 'yi-lightning', name: 'Yi Lightning', provider: '01.AI', desc: 'Ultra-fast inference. Bilingual excellence.', color: '#2563eb', bg: '#eff6ff' },
  { id: 'yi-large', name: 'Yi Large', provider: '01.AI', desc: 'Frontier-level reasoning. 200K context.', color: '#2563eb', bg: '#eff6ff' },
]

const PROVIDER_COLORS: Record<string, { color: string; bg: string }> = {
  Anthropic: { color: '#c9a96e', bg: '#fdf8ef' },
  OpenAI:    { color: '#10a37f', bg: '#f0fdf4' },
  Google:    { color: '#4285f4', bg: '#eff6ff' },
  DeepSeek:  { color: '#231f20', bg: '#f9f9f9' },
  Alibaba:   { color: '#e05400', bg: '#fff7ed' },
  Zhipu:     { color: '#6b21a8', bg: '#faf5ff' },
  Mistral:   { color: '#b45309', bg: '#fff7ed' },
  Meta:      { color: '#dc2626', bg: '#fef2f2' },
  '01.AI':   { color: '#2563eb', bg: '#eff6ff' },
}

const MODEL_PRICING: Record<string, { ours: string; official: string; save: string }> = {
  'gpt-6':            { ours: '$8.00', official: '$30.00', save: '73%' },
  'gpt-5.5-turbo':    { ours: '$2.00', official: '$10.00', save: '80%' },
  'gpt-4.7':          { ours: '$0.60', official: '$5.00', save: '88%' },
  'claude-opus-5':    { ours: '$8.00', official: '$30.00', save: '73%' },
  'claude-sonnet-5':  { ours: '$2.00', official: '$8.00', save: '75%' },
  'claude-haiku-4.7': { ours: '$0.60', official: '$2.50', save: '76%' },
  'gemini-4':         { ours: '$2.00', official: '$8.00', save: '75%' },
  'gemini-3.5-pro':   { ours: '$1.50', official: '$6.00', save: '75%' },
  'gemini-3.5-flash': { ours: '$0.30', official: '$1.00', save: '70%' },
  'deepseek-v5':      { ours: '$1.50', official: '$5.00', save: '70%' },
  'deepseek-r3':      { ours: '$2.00', official: '$6.00', save: '67%' },
  'deepseek-v4-flash':{ ours: '$0.30', official: '$1.00', save: '70%' },
  'qwen4':            { ours: '$1.50', official: '$5.00', save: '70%' },
  'qwen3-max':        { ours: '$1.50', official: '$4.00', save: '63%' },
  'qwen3-turbo':      { ours: '$0.30', official: '$0.80', save: '63%' },
  'qwq-32b':          { ours: '$0.50', official: '$1.50', save: '67%' },
  'glm-6':            { ours: '$1.50', official: '$5.00', save: '70%' },
  'glm-5.5':          { ours: '$0.60', official: '$2.00', save: '70%' },
  'mistral-large-3':  { ours: '$1.50', official: '$6.00', save: '75%' },
  'mistral-small-4':  { ours: '$0.30', official: '$1.00', save: '70%' },
  'codestral-2':      { ours: '$0.50', official: '$2.00', save: '75%' },
  'llama-5-70b':      { ours: '$1.50', official: '$4.00', save: '63%' },
  'llama-5-8b':       { ours: '$0.30', official: '$0.80', save: '63%' },
  'yi-lightning':     { ours: '$0.15', official: '$0.40', save: '63%' },
  'yi-large':         { ours: '$1.00', official: '$3.00', save: '67%' },
}

export default function ModelsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Models</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1rem' }}>Latest generation AI models &mdash; updated June 2026</p>
      </div>

      {Object.keys(PROVIDER_COLORS).map(provider => {
        const pModels = MODELS.filter(m => m.provider === provider)
        if (!pModels.length) return null
        const { color, bg } = PROVIDER_COLORS[provider]
        return (
          <div key={provider} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{provider}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
              {pModels.map(m => {
                const pricing = MODEL_PRICING[m.id]
                return (
                  <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.2rem' }}>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.15rem' }}>{m.desc}</div>
                    </div>
                    {pricing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-gray)', borderTop: '1px solid var(--border)', marginTop: '0.6rem', paddingTop: '0.6rem' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{pricing.ours}</span>
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{pricing.official}</span>
                        <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.1rem 0.45rem', borderRadius: 4, fontWeight: 600, fontSize: '0.7rem' }}>Save {pricing.save}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
