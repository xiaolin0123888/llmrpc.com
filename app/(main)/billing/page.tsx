'use client'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Basic',
    price: '19',
    monthly_quota: '500,000',
    overage: '0.0012',
    features: [
      'All Standard Models Access',
      '500,000 Monthly Free Tokens',
      'Global Edge Nodes',
      'Standard API Speed',
      'Email Support',
    ],
    hot: false,
  },
  {
    name: 'Pro',
    price: '49',
    monthly_quota: '2,000,000',
    overage: '0.0009',
    features: [
      'All Premium Models Unlocked',
      '2,000,000 Monthly Free Tokens',
      'High Priority Channel',
      'Low Latency Global Network',
      'Priority Support',
    ],
    hot: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    monthly_quota: '6,000,000',
    overage: '0.0006',
    features: [
      'Full Model Suite Access',
      '6,000,000 Monthly Free Tokens',
      'Dedicated Private Channel',
      'Unlimited Concurrency',
      '7x24 Custom Support',
    ],
    hot: false,
  },
  {
    name: 'Unlimited',
    price: '199',
    monthly_quota: 'Unlimited',
    overage: '0',
    features: [
      'All Models Permanent Access',
      'Unlimited Monthly Token Usage',
      'Premium Global Acceleration',
      'Private Deployment Support',
      'Full Custom Development',
    ],
    hot: false,
  },
]

const BILLING_RULES = [
  { label: 'All models share the same token quota', desc: 'Input + Output tokens counted together' },
  { label: 'Monthly free quota auto-resets on 1st every month', desc: 'Real-time token deduction and balance update' },
  { label: 'Automatically charge overage fees after quota exhausted', desc: 'Pay-as-you-go real time deduction' },
  { label: 'Unlimited Plan Exclusive Benefit', desc: 'Permanent no extra overage cost' },
]

const MODELS = [
  'gpt-4o', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet',
  'gemini-pro', 'gemini-ultra', 'llama-3-70b', 'llama-3-8b',
  'qwen-turbo', 'qwen-plus', 'mistral-large', 'deepseek-chat',
]

export default function BillingPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.8rem' }}>
          One API Key — All AI Models
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          Unified global inference network. One endpoint, one key, one billing system to access all top-tier large language models.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {PLANS.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: '1.8rem',
              borderColor: p.hot ? 'var(--primary)' : undefined,
              transform: p.hot ? 'scale(1.02)' : undefined,
              boxShadow: p.hot ? '0 8px 25px rgba(59,130,246,0.12)' : undefined,
              position: 'relative',
            }}
          >
            {p.hot && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.78rem', color: '#fff' }}>
                Most Popular
              </div>
            )}
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{p.name}</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>
              ${p.price}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-gray)' }}>/month</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 500, marginBottom: '1.2rem' }}>
              {p.name === 'Unlimited' ? 'No Overage Charges' : `Overage: $${p.overage} / 1K Tokens`}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>
              {p.monthly_quota} free tokens/month
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
              {p.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '0.6rem', paddingTop: '0.2rem' }}>
                  <Check size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={p.hot ? 'btn-primary' : 'btn-outline'}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
            >
              {p.hot ? 'Get Started' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Billing Rules */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.5rem', textAlign: 'center' }}>Unified Billing and Overage Rules</h3>
        {BILLING_RULES.map((r) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-dark)' }}>{r.label}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Models */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Supported AI Models</h3>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {MODELS.map((m) => (
            <span key={m} className="model-tag" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  )
}