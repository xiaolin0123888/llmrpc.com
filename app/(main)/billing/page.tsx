'use client'
import { useState } from 'react'
import { CreditCard, Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Basic Free Plan',
    price: '$0',
    period: '/ Month',
    desc: 'For new users to explore',
    features: ['Limited daily calling quota', 'Partial mainstream model access', 'Ordinary global common nodes', 'Standard response speed'],
    cta: 'Current Using',
    hot: false,
  },
  {
    name: 'Starter Premium',
    price: '$29.9',
    period: '/ Month',
    desc: 'For individual developers',
    features: ['Large monthly token quota', 'All models full open access', 'Priority low latency dedicated nodes', 'Higher concurrency support', 'Fast priority technical support'],
    cta: 'Upgrade Now',
    hot: true,
  },
  {
    name: 'Enterprise Ultimate',
    price: '$99.9',
    period: '/ Month',
    desc: 'For teams and businesses',
    features: ['Nearly unlimited token consumption', 'Exclusive enterprise private nodes', 'Ultra low delay global line', 'Unlimited high concurrent requests', 'One-on-one exclusive technical docking'],
    cta: 'Contact Subscribe',
    hot: false,
  },
]

const AMOUNTS = ['$10', '$20', '$50', '$100', '$200', '$500']

export default function BillingPage() {
  const [balance] = useState('$48.20')
  const [selected, setSelected] = useState('$50')

  return (
    <div>
      {/* Balance */}
      <div className="card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-gray)', marginBottom: '0.4rem' }}>Account Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)' }}>{balance}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '0.7rem 1.5rem' }}>Withdraw</button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Subscription Plans</h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Choose a suitable plan to upgrade your API service experience</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {PLANS.map((p) => (
            <div
              key={p.name}
              className="card"
              style={{ padding: '2rem', position: 'relative', borderColor: p.hot ? 'var(--primary)' : undefined }}
            >
              {p.hot && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.78rem', color: '#fff' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.8rem' }}>{p.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{p.price}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-gray)' }}>{p.period}</span></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>{p.desc}</p>
              <ul style={{ listStyle: 'none', marginBottom: '1.8rem' }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-gray)', marginBottom: '0.6rem' }}>
                    <Check size={14} color="var(--success)" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.cta === 'Current Using' ? 'btn-outline' : 'btn-primary'}
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recharge */}
      <div className="card" style={{ padding: '1.8rem', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Recharge Credits</h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Select an amount to top up</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setSelected(a)}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: selected === a ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: selected === a ? 'rgba(37,99,235,0.06)' : 'var(--bg-card)',
                color: 'var(--text-dark)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-gray)', fontSize: '0.88rem' }}>Recharge amount</span>
            <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{selected}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-gray)', fontSize: '0.88rem' }}>Payment method</span>
            <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Stripe</span>
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
          <CreditCard size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
