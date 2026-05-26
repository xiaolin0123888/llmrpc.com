'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const PAYG_PLAN = {
  id: 'payg',
  name: 'Pay as you go',
  price: 0,
  description: 'No monthly fee. Top up anytime.',
  tokens: null,
  overage: '$0.006 / 1K tokens',
  recommended: false,
}

export default function BillingPage() {
  const [credits, setCredits] = useState<number | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => { if (d.credits !== undefined) setCredits(d.credits) })
      .catch(() => {})
    fetch('/api/plans')
      .then(r => r.json())
      .then(d => { if (d.plans) setPlans(d.plans) })
      .finally(() => setLoading(false))
  }, [])

  const formatQuota = (quota: number) => {
    if (quota >= 9999999999) return 'Unlimited'
    if (quota >= 1000000) return `${(quota / 1000000).toFixed(0)}M`
    if (quota >= 1000) return `${(quota / 1000).toFixed(0)}K`
    return quota.toString()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Pricing</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Choose a plan that fits your needs. All plans include our full model library access.</p>

      {credits !== null && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Your current balance:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{credits.toLocaleString()} credits</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {plans.map((plan, idx) => {
          const isPopular = plan.name === 'Pro'
          return (
            <div key={plan.id} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isPopular ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 16,
              padding: '2rem',
              position: 'relative',
              transform: isPopular ? 'scale(1.02)' : 'none',
              boxShadow: isPopular ? '0 8px 24px rgba(37,99,235,0.1)' : 'none',
            }}>
              {isPopular && (
                <div style={{ position: 'absolute', top: -1, right: 20, background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '0.25rem 0.7rem', borderRadius: '0 0 6px 6px', fontWeight: 600 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
                ${Number(plan.price).toFixed(2)}<span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 400 }}>/mo</span>
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {formatQuota(Number(plan.monthly_quota))} tokens/month
              </p>
              {Number(plan.overage_rate) > 0 && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>
                  Overage: ${Number(plan.overage_rate).toFixed(4)} / 1K tokens
                </p>
              )}
              {Number(plan.overage_rate) === 0 && plan.name !== 'Unlimited' && (
                <p style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>
                  No overage charges
                </p>
              )}
              {plan.name === 'Unlimited' && (
                <p style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1.5rem' }}>
                  No overage • Unlimited usage
                </p>
              )}
              <Link href="/dashboard" style={{
                display: 'block', textAlign: 'center', padding: '0.7rem',
                background: 'var(--primary)', color: '#fff', borderRadius: 10,
                fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
              }}>
                Get Started
              </Link>
            </div>
          )
        })}

        {/* Pay as you go card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '2rem',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -1, right: 20, background: 'var(--text-gray)', color: '#fff', fontSize: '0.7rem', padding: '0.25rem 0.7rem', borderRadius: '0 0 6px 6px', fontWeight: 600 }}>
            No Subscription
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{PAYG_PLAN.name}</h3>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
            $0.006<span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 400 }}>/1K tokens</span>
          </div>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>No monthly fee. Top up credits anytime.</p>
          <Link href="/dashboard" style={{
            display: 'block', textAlign: 'center', padding: '0.7rem',
            background: 'transparent', color: 'var(--text-dark)',
            border: '1px solid var(--border)', borderRadius: 10,
            fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            Buy Credits →
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>All Plans Include</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            'Access to 100+ AI models',
            'OpenAI-compatible API',
            'Global edge nodes',
            'Real-time usage dashboard',
            'API key management',
            'Monthly token reset',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}