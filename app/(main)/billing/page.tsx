'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BillingPage() {
  const [credits, setCredits] = useState<number | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => { if (d.credits !== undefined) setCredits(d.credits) })
      .catch(() => {})
    fetch('/api/models')
      .then(r => r.json())
      .then(() => {
        setPlans([
          { id: 1, name: 'Starter', price: 10, monthly_quota: 5000 },
          { id: 2, name: 'Pro', price: 50, monthly_quota: 50000 },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Pricing</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Choose a plan that fits your needs. No subscriptions required — pay as you go with credits.</p>
      {credits !== null && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Your current balance:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{credits.toLocaleString()} credits</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{plan.name}</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
              ${Number(plan.price).toFixed(2)}<span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 400 }}>/mo</span>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{Number(plan.monthly_quota).toLocaleString()} credits/month</p>
            <Link href="/dashboard" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Get Started</Link>
          </div>
        ))}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: 14, padding: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -1, right: 16, background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '0 0 6px 6px', fontWeight: 600 }}>Recommended</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Pay as you go</h3>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
            $0.006<span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 400 }}>/1K tokens</span>
          </div>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>No monthly fee. Top up anytime.</p>
          <Link href="/dashboard" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Buy Credits →</Link>
        </div>
      </div>
    </div>
  )
}