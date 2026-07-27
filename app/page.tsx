import Link from 'next/link'
import { auth } from '@/lib/auth'

const MODELS = [
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', upstream: 'DeepSeek V4 Pro', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'deepseek-v4-reason', name: 'DeepSeek V4 Reason', upstream: 'DeepSeek V4 Pro', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', upstream: 'DeepSeek V4 Flash', color: '#2563eb', bg: '#eff6ff' },
  { id: 'glm-5.1', name: 'GLM-5.1', upstream: 'GLM-5.1', color: '#059669', bg: '#ecfdf5' },
  { id: 'glm-5.2', name: 'GLM-5.2', upstream: 'GLM-5.2', color: '#0891b2', bg: '#ecfeff' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', upstream: 'DeepSeek V4 Flash', color: '#231f20', bg: '#f9f9f9' },
  { id: 'qwen-turbo', name: 'Qwen Turbo', upstream: 'GLM-5.2', color: '#e05400', bg: '#fff7ed' },
]

export default async function HomePage() {
  const session = await auth()
  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">LLM<span>Rpc</span></a>
        <div className="nav-menu">
          <Link href="/models">Models</Link>
          <Link href="/billing">Pricing</Link>
          <Link href="/docs">Docs</Link>
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
        <section style={{ textAlign: 'center' as const, paddingTop: '7rem', paddingBottom: '4rem', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: 99, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            10 models — always up to date
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>
            One API key.<br />
            <span style={{ color: 'var(--primary)' }}>Every AI model.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-gray)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Access DeepSeek, Qwen, GLM, and 10 models through a single OpenAI-compatible endpoint. One key. One billing system. Radically simpler.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn-primary" href="/register" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Start Free →</a>
            <a className="btn-outline" href="/models" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>View Models</a>
          </div>
        </section>

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
      "model": "deepseek-v4-pro",
      "messages": [{"role": "user", "content": "Hello!"}]
    }'

$ # Switch models instantly — just change the name
$ # deepseek-v4-pro, deepseek-v4-flash, deepseek-v4-reason, glm-5.1, glm-5.2, deepseek-chat, qwen-turbo`}
            </pre>
          </div>
        </section>

        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem', background: 'var(--bg-card)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div><div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>10+</div><div style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>Models</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>$0.02</div><div style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>Per 1K tokens</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>50+</div><div style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>Countries</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>99.9%</div><div style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>Uptime SLA</div></div>
          </div>
        </section>

        <section className="section">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why developers choose LLMRpc</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            {[
              { title: 'OpenAI Compatible', desc: 'Drop-in replacement. One line change to access 10 models.' },
              { title: 'One Key, All Models', desc: 'No juggling API keys. One balance covers every model.' },
              { title: 'Transparent Pricing', desc: 'Flat credit system. No per-model markups or hidden fees.' },
              { title: 'Real-time Dashboard', desc: 'Track usage, latency, and costs per request. Full audit trail.' },
              { title: 'Rate Limiting', desc: 'Per-key rate limits and spending caps keep costs under control.' },
              { title: 'No Lock-in', desc: 'Switch models without rewriting code. Your infra, your choice.' },
            ].map((f) => (
              <div className="card" key={f.title}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Available Models</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2.5rem' }}>
            From flagship reasoning to budget-friendly chat — all behind one API
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
            {MODELS.map((m) => (
              <span key={m.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', borderRadius: 99,
                background: m.bg, color: m.color,
                border: '1px solid ' + m.color + '30',
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'monospace',
              }}>{m.name}</span>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.95rem' }} href="/models">View all 10 models →</a>
          </div>
        </section>

        <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Free 1,000,000 credits on signup
          </h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: 500, margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            No credit card required. Try every model risk-free. Pay only when you need more.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn-primary" href="/register" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Get Started →</a>
            <a className="btn-outline" href="/docs" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>View Docs →</a>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund">Refund</a> · <a href="/billing">Pricing</a>
        </div>
        <div>&copy; {new Date().getFullYear()} LLMRpc. All rights reserved.</div>
      </footer>
    </>
  )
}
