import Link from 'next/link'
import { MODEL_PRICING } from '@/lib/models-config'

const MODELS = [
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', upstream: 'DeepSeek V4 Pro', desc: 'Flagship performance. Best all-around for complex tasks, coding, analysis.', tier: 'Pro' },
  { id: 'deepseek-v4-reason', name: 'DeepSeek V4 Reason', upstream: 'DeepSeek V4 Pro', desc: 'Deep reasoning mode. Step-by-step thinking for math, logic, planning.', tier: 'Enterprise' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', upstream: 'DeepSeek V4 Flash', desc: 'Fast and affordable. Perfect for high-volume, low-latency applications.', tier: 'Free' },
  { id: 'glm-5.1', name: 'GLM-5.1', upstream: 'GLM-5.1', desc: 'Strong mid-tier model. Balanced speed, quality, and cost.', tier: 'Basic' },
  { id: 'glm-5.2', name: 'GLM-5.2', upstream: 'GLM-5.2', desc: 'Budget-friendly workhorse. Great for simple chats and prototyping.', tier: 'Free' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', upstream: 'DeepSeek V4 Flash', desc: 'General-purpose chat. Fast, reliable, cost-efficient.', tier: 'Free' },
  { id: 'qwen-turbo', name: 'Qwen Turbo', upstream: 'GLM-5.2', desc: 'Quick, efficient responses. Great for lightweight tasks.', tier: 'Free' },
]

export default function ModelsPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Models
      </h1>
      <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Every model, one API key. Transparent pricing — pay only for what you use.
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {MODELS.map((m) => {
          const price = MODEL_PRICING[m.id]
          return (
            <div key={m.id} style={{
              border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.05rem', fontFamily: 'monospace' }}>{m.name}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem', borderRadius: 99,
                    background: m.tier === 'Free' ? '#f3f4f6' : m.tier === 'Enterprise' ? '#fef2f2' : '#eff6ff',
                    color: m.tier === 'Free' ? '#6b7280' : '#2563eb',
                  }}>{m.tier}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{m.desc}</div>
                <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '0.25rem' }}>
                  Powered by {m.upstream}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 140 }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.15rem' }}>per 1K tokens</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {price?.inputPrice?.toFixed(2)} in / {price?.outputPrice?.toFixed(2)} out
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  ~{((price?.inputPrice || 0) * 700 + (price?.outputPrice || 0) * 300).toFixed(2)}/1M blended
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>How pricing works</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem' }}>
          Credits are 1:1 with tokens. $1 = 100,000 credits. Input and output tokens are billed
          separately at the rates above. The blended estimate assumes 70% input / 30% output
          — your actual cost depends on your usage pattern.
        </p>
        <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Subscription plans include monthly token quotas. Overage is billed from your credits.{' '}
          <Link href="/billing" style={{ color: '#2563eb' }}>See plan details →</Link>
        </p>
      </div>
    </main>
  )
}
