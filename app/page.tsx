import Link from 'next/link'
import { auth } from '@/lib/auth'

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
        <section className="section" style={{ textAlign: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
            🚀 All models now available at up to 70% lower cost
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2, marginBottom: '1.2rem' }}>
            Global Unified<br />
            <span style={{ color: 'var(--primary)' }}>AI API Gateway</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)', maxWidth: 640, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Access 100+ AI models through a single API endpoint. Prepaid credits and subscription plans. OpenAI compatible.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
            <a className="btn-primary" href="/login">Get Started Free →</a>
            <a className="btn-outline" href="/dashboard">View Documentation</a>
          </div>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['80T+', 'Monthly Tokens'], ['100K+', 'Global Users'], ['8+', 'Providers'], ['100+', 'Models']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>{v}</div>
                <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '0 6rem 5rem', maxWidth: 1200, margin: '0 auto' }}>
          <div className="status-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="status-dot" />
              <span className="status-text">All systems operational</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {['API Normal', 'Nodes Online', '99.9% Uptime'].map(s => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-gray)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} /> {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="section-title" style={{ textAlign: 'center' }}>Supported Models</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2.5rem' }}>Access all major AI providers through one unified API</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Qwen 2.5', 'DeepSeek V3', 'GLM-4', 'Mistral', 'Yi Lightning'].map(m => (
              <span key={m} className="model-tag" style={{ padding: '0.4rem 1rem', borderRadius: 20, background: 'var(--bg-main)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-gray)' }}>{m}</span>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 500, fontSize: '0.95rem' }} href="/models">View all models →</a>
          </div>
        </section>

        <section className="section">
          <div className="section-title" style={{ textAlign: 'center' }}>Why LLMRpc?</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '3rem' }}>Everything you need to build AI-powered applications</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            {[
              { icon: '🛡️', title: 'Higher Availability', desc: 'Reliable AI models via distributed infrastructure. Fall back to other providers when one goes down.' },
              { icon: '📈', title: 'Price and Performance', desc: 'Keep costs in check without sacrificing speed. Edge network for minimal latency worldwide.' },
              { icon: '🔑', title: 'API Key Management', desc: 'Create keys, set rate limits, monitor usage. Full control over your API access.' },
            ].map(f => (
              <div key={f.title} className="card">
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', fontSize: '1.5rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.7rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="section-title" style={{ textAlign: 'center' }}>Get Started in Minutes</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '3rem' }}>Three simple steps to start using AI models</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', maxWidth: 900, margin: '0 auto' }}>
            {[
              { n: '1', title: 'Sign Up', desc: 'Create an account to get started. No credit card required.' },
              { n: '2', title: 'Buy Credits', desc: 'Credits can be used with any model. No subscriptions required.' },
              { n: '3', title: 'Get Your API Key', desc: 'Create an API key and start making requests. OpenAI compatible.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '1.2rem', fontWeight: 700 }}>{s.n}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title" style={{ textAlign: 'center' }}>OpenAI Compatible</div>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2rem' }}>Switch from OpenAI in one line of code</p>
          <div className="code-box">
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>// cURL example</div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.6 }}>
{`curl https://llmrpc.com/v1/chat/completions \\
  -H "Authorization: Bearer \\${process.env.API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a className="btn-primary" href={dashboardLink}>Get Your API Key →</a>
          </div>
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