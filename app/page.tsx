import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Key, CheckCircle2, Zap, Globe, Cpu, Star, ChevronRight } from 'lucide-react'

const STATS = [
  { value: '80T+', label: 'Monthly Tokens' },
  { value: '100K+', label: 'Global Users' },
  { value: '8+', label: 'Providers' },
  { value: '100+', label: 'Models' },
]

const FEATURES = [
  {
    title: 'Higher Availability',
    desc: 'Reliable AI models via distributed infrastructure. Fall back to other providers when one goes down.',
    icon: Shield,
  },
  {
    title: 'Price and Performance',
    desc: 'Keep costs in check without sacrificing speed. Edge network for minimal latency worldwide.',
    icon: TrendingUp,
  },
  {
    title: 'API Key Management',
    desc: 'Create keys, set rate limits, monitor usage. Full control over your API access.',
    icon: Key,
  },
]

const STEPS = [
  { num: '1', title: 'Sign Up', desc: 'Create an account to get started. No credit card required.', icon: CheckCircle2 },
  { num: '2', title: 'Buy Credits', desc: 'Credits can be used with any model. No subscriptions required.', icon: Zap },
  { num: '3', title: 'Get Your API Key', desc: 'Create an API key and start making requests. OpenAI compatible.', icon: Key },
]

const MODELS = ['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Qwen 2.5', 'DeepSeek V3', 'GLM-4', 'Mistral', 'Yi Lightning']

const CODE = `curl https://llmrpc.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
          🚀 All models now available at up to 70% lower cost
        </div>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2, marginBottom: '1.2rem' }}>
          Global Unified<br /><span style={{ color: 'var(--primary)' }}>AI API Gateway</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)', maxWidth: '640px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Access 100+ AI models through a single API endpoint. Prepaid credits and subscription plans. OpenAI compatible.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <Link href="/(auth)/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="btn-outline">
            View Documentation
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>{s.value}</div>
              <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Status Bar */}
      <section style={{ padding: '0 6rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="status-dot" />
            <span className="status-text">All systems operational</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-gray)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} /> API Normal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-gray)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} /> Nodes Online
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-gray)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} /> 99.9% Uptime
            </span>
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="section-title" style={{ textAlign: 'center' }}>Supported Models</div>
        <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2.5rem' }}>Access all major AI providers through one unified API</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {MODELS.map((m) => (
            <span key={m} className="model-tag">{m}</span>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/models" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 500, fontSize: '0.95rem' }}>
            View all models <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="section-title" style={{ textAlign: 'center' }}>Why LLMRpc?</div>
        <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '3rem' }}>Everything you need to build AI-powered applications</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <f.icon size={22} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.7rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'var(--bg-card)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="section-title" style={{ textAlign: 'center' }}>Get Started in Minutes</div>
        <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '3rem' }}>Three simple steps to start using AI models</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '1.2rem', fontWeight: 700 }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="section-title" style={{ textAlign: 'center' }}>OpenAI Compatible</div>
        <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2rem' }}>Switch from OpenAI in one line of code</p>
        <div className="code-box">
          <div className="code-title">// cURL example</div>
          <pre>{CODE}</pre>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/(auth)/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Start Building <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
