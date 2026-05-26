import Link from 'next/link'
import { auth } from '@/lib/auth'

// 最新模型列表（截至 2026年5月27日）
const MODELS = [
  // Anthropic
  { id: 'claude-opus-4.7', name: 'Claude Opus 4.7', provider: 'Anthropic', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', color: '#c9a96e', bg: '#fdf8ef' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', color: '#c9a96e', bg: '#fdf8ef' },
  // OpenAI
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: '#10a37f', bg: '#f0fdf4' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', color: '#10a37f', bg: '#f0fdf4' },
  // Google
  { id: 'gemini-3.5', name: 'Gemini 3.5', provider: 'Google', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', color: '#4285f4', bg: '#eff6ff' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', color: '#4285f4', bg: '#eff6ff' },
  // Alibaba Qwen
  { id: 'qwen3', name: 'Qwen3', provider: 'Alibaba', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwq-32b', name: 'QwQ-32B', provider: 'Alibaba', color: '#e05400', bg: '#fff7ed' },
  { id: 'qwen2.5-72b', name: 'Qwen2.5 72B', provider: 'Alibaba', color: '#e05400', bg: '#fff7ed' },
  // DeepSeek
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', color: '#231f20', bg: '#f9f9f9' },
  { id: 'deepseek-r2', name: 'DeepSeek R2', provider: 'DeepSeek', color: '#231f20', bg: '#f9f9f9' },
  // Zhipu GLM
  { id: 'glm-5', name: 'GLM-5', provider: 'Zhipu', color: '#6b21a8', bg: '#faf5ff' },
  { id: 'glm-5.1-highspeed', name: 'GLM-5.1 Highspeed', provider: 'Zhipu', color: '#6b21a8', bg: '#faf5ff' },
  // Mistral
  { id: 'mistral-medium-3.5', name: 'Mistral Medium 3.5', provider: 'Mistral', color: '#e05400', bg: '#fff7ed' },
  { id: 'mistral-small-4', name: 'Mistral Small 4', provider: 'Mistral', color: '#e05400', bg: '#fff7ed' },
  { id: 'codestral', name: 'Codestral', provider: 'Mistral', color: '#e05400', bg: '#fff7ed' },
  // 01.AI
  { id: 'yi-lightning', name: 'Yi Lightning', provider: '01.AI', color: '#2563eb', bg: '#eff6ff' },
  { id: 'yi-large', name: 'Yi Large', provider: '01.AI', color: '#2563eb', bg: '#eff6ff' },
]

export default async function HomePage() {
  const session = await auth()
  const dashboardLink = session ? '/dashboard' : '/login'

  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">LLM<span>Rpc</span></a>
        <div className="nav-menu">
          <Link href="/models">Models</Link>
          <Link href="/billing">Pricing</Link>
          {session ? (
            <Link href="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Sign In</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section style={{ textAlign: 'center', paddingTop: '7rem', paddingBottom: '4rem', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: 99, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            Updated May 2026 — 100+ models now available
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>
            One API key.<br />
            <span style={{ color: 'var(--primary)' }}>Every AI model.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-gray)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Access GPT-5.5, Claude Opus 4.7, Gemini 3.5, and 100+ other models through a single OpenAI-compatible endpoint. One billing system. One API key.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn-primary" href="/register" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Start Free →</a>
            <a className="btn-outline" href="/models" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>View Models</a>
          </div>
        </section>

        {/* Code example */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 2rem 5rem' }}>
          <div className="code-box" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>terminal</span>
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
{`$ curl https://llmrpc.com/v1/chat/completions \\
    -H "Authorization: Bearer sk-..." \\
    -H "Content-Type: application/json" \\
    -d '{
      "model": "claude-opus-4.7",
      "messages": [{"role": "user", "content": "Hello!"}]
    }'

$ # Switch models instantly — no code changes needed
$ # Works with: claude-opus-4.7, gpt-5.5, gemini-3.5, deepseek-v3`}
            </pre>
          </div>
        </section>

        {/* Stats */}
        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem', background: 'var(--bg-card)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {[['100+', 'Models'], ['$0.006', 'Per 1K tokens'], ['50+', 'Countries'], ['99.9%', 'Uptime SLA']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{v}</div>
                <div style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="section">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why developers choose LLMRpc</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            {[
              { title: 'OpenAI Compatible', desc: 'Drop-in replacement for OpenAI. Change one line of code to switch providers.' },
              { title: 'Unified Billing', desc: 'One balance for all models. No juggling multiple accounts or API keys.' },
              { title: 'Smart Routing', desc: 'Automatic failover and load balancing across multiple providers.' },
              { title: 'Real-time Logs', desc: 'Track token usage, latency, and costs per request in your dashboard.' },
              { title: 'Rate Limiting', desc: 'Per-key rate limits and spending caps to keep costs under control.' },
              { title: 'Webhook Support', desc: 'Stream responses and receive real-time usage events.' },
            ].map(f => (
              <div key={f.title} className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Models */}
        <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Supported Models</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2.5rem' }}>Latest models as of May 2026 — from frontier to open-source, access them all</p>

          {['Anthropic', 'OpenAI', 'Google', 'Alibaba', 'DeepSeek', 'Zhipu', 'Mistral', '01.AI'].map(provider => {
            const providerModels = MODELS.filter(m => m.provider === provider)
            if (!providerModels.length) return null
            return (
              <div key={provider} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{provider}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {providerModels.map(m => (
                    <span key={m.id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.9rem', borderRadius: 99,
                      background: m.bg, color: m.color,
                      border: `1px solid ${m.color}30`,
                      fontSize: '0.8rem', fontWeight: 500,
                      fontFamily: 'monospace',
                    }}>
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.95rem' }} href="/models">View all 100+ models →</a>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="section" style={{ textAlign: 'center' }}>
          <div className="section-title" style={{ marginBottom: '0.75rem' }}>Simple, transparent pricing</div>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2.5rem' }}>No hidden fees. Pay per token or choose a plan with monthly credits.</p>
          <a className="btn-primary" href="/billing" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>View Pricing →</a>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
        <div className="footer-inner">
          <div className="footer-col">
            <h4>LLMRpc</h4>
            <p>Global unified AI API gateway. Access 100+ models through a single API endpoint.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="/models">Models</a>
            <a href="/billing">Pricing</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/register">Get Started</a>
          </div>
          <div className="footer-col">
            <h4>Developers</h4>
            <a href="/dashboard">Documentation</a>
            <a href="/dashboard">API Reference</a>
            <a href="/dashboard">Status</a>
            <a href="/referrals">Affiliate Program</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/refund">Refund Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)', fontSize: '0.88rem', borderTop: '1px solid var(--border)' }}>
          © 2026 LLMRpc.com. All rights reserved.
        </div>
      </footer>
    </>
  )
}