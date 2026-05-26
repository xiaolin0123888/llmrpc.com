import Link from 'next/link'

const MODELS = [
  { id: 'claude-opus-4.7', name: 'Claude Opus 4.7', provider: 'Anthropic', desc: 'Highest capability. Complex reasoning, coding, agentic tasks.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', desc: 'Balanced performance and cost. General purpose.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', desc: 'Fast and cost-efficient. High-volume workflows.', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', desc: 'Smartest model. Coding, research, data analysis.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', desc: 'Multimodal. Vision, audio, text understanding.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', desc: 'Fast, affordable. Lightweight tasks.', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gemini-3.5', name: 'Gemini 3.5', provider: 'Google', desc: 'Frontier intelligence with action. Agentic & coding.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', desc: 'Long context up to 1M tokens. Advanced reasoning.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', desc: 'Speed-optimized. High-frequency workloads.', color: '#4285f4', bg: '#eff6ff' },
  { id: 'qwen3', name: 'Qwen3', provider: 'Alibaba', desc: 'Open-source frontier model. 8 dense + 2 MoE variants.', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwq-32b', name: 'QwQ-32B', provider: 'Alibaba', desc: 'Reasoning model. Math & coding focus.', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwen2.5-72b', name: 'Qwen2.5 72B', provider: 'Alibaba', desc: 'Large capacity. Multilingual & instruction following.', color: '#e05400', bg: '#fff7ed' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', desc: '671B MoE, 37B active. Efficient inference.', color: '#231f20', bg: '#f9f9f9' },
  { id: 'deepseek-r2', name: 'DeepSeek R2', provider: 'DeepSeek', desc: 'Advanced reasoning. Extended context.', color: '#231f20', bg: '#f9f9f9' },
  { id: 'glm-5', name: 'GLM-5', provider: 'Zhipu', desc: '745B params, frontier reasoning. Agentic tasks.', color: '#6b21a8', bg: '#faf5ff' },
  { id: 'glm-5.1-highspeed', name: 'GLM-5.1 Highspeed', provider: 'Zhipu', desc: '400 tokens/s output. World\'s fastest API speed.', color: '#6b21a8', bg: '#faf5ff' },
  { id: 'mistral-medium-3.5', name: 'Mistral Medium 3.5', provider: 'Mistral', desc: '128B flagship. Agentic & async coding.', color: '#e05400', bg: '#fff7ed' },
  { id: 'mistral-small-4', name: 'Mistral Small 4', provider: 'Mistral', desc: 'Compact powerhouse. Speed & efficiency.', color: '#e05400', bg: '#fff7ed' },
  { id: 'codestral', name: 'Codestral', provider: 'Mistral', desc: 'Coding-specialized. 32k context.', color: '#e05400', bg: '#fff7ed' },
  { id: 'yi-lightning', name: 'Yi Lightning', provider: '01.AI', desc: 'Ultra-fast inference. Bilingual excellence.', color: '#2563eb', bg: '#eff6ff' },
  { id: 'yi-large', name: 'Yi Large', provider: '01.AI', desc: 'Frontier-level reasoning. 200k context.', color: '#2563eb', bg: '#eff6ff' },
]

const PROVIDER_COLORS: Record<string, { color: string; bg: string }> = {
  Anthropic: { color: '#c9a96e', bg: '#fdf8ef' },
  OpenAI:    { color: '#10a37f', bg: '#f0fdf4' },
  Google:    { color: '#4285f4', bg: '#eff6ff' },
  Alibaba:   { color: '#e05400', bg: '#fff7ed' },
  DeepSeek:  { color: '#231f20', bg: '#f9f9f9' },
  Zhipu:     { color: '#6b21a8', bg: '#faf5ff' },
  Mistral:   { color: '#e05400', bg: '#fff7ed' },
  '01.AI':   { color: '#2563eb', bg: '#eff6ff' },
}

export default function ModelsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Models</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1rem' }}>100+ latest models as of May 2026 — access them all through one API</p>
      </div>

      {Object.keys(PROVIDER_COLORS).map(provider => {
        const pModels = MODELS.filter(m => m.provider === provider)
        if (!pModels.length) return null
        const { color, bg } = PROVIDER_COLORS[provider]
        return (
          <div key={provider} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{provider}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {pModels.map(m => (
                <div key={m.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '1.25rem',
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{m.name}</h3>
                      <span style={{
                        display: 'inline-block', fontSize: '0.7rem', fontWeight: 500,
                        color, background: bg, border: `1px solid ${color}30`,
                        padding: '0.15rem 0.6rem', borderRadius: 99,
                      }}>{m.provider}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', lineHeight: 1.5, margin: '0 0 0.75rem' }}>{m.desc}</p>
                  <code style={{ fontSize: '0.7rem', color: 'var(--text-gray)', background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)' }}>{m.id}</code>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-gray)', marginBottom: '1rem' }}>Ready to start?</p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem', fontSize: '1rem' }}>Get Your API Key →</Link>
      </div>
    </div>
  )
}