'use client'
import { useState } from 'react'
import { Gift, Copy, CheckCircle2, Users, DollarSign } from 'lucide-react'

const STATS = [
  { label: 'Total Referrals', value: '12', icon: Users },
  { label: 'Referral Earnings', value: '360 USD', icon: DollarSign },
  { label: 'Commission Rate', value: '30%', icon: Gift },
]

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const referralLink = 'https://llmrpc.com/register?ref=xiaolin0123888'

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '14px', padding: '2.5rem', color: '#fff', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Gift size={28} />
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>Invite and Earn</span>
          </div>
          <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6, marginBottom: '2rem' }}>
            Invite friends to join LLMRpc and earn 30% commission on their all spending, forever.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.8rem 1.2rem', fontFamily: 'monospace', fontSize: '0.9rem', flex: 1, maxWidth: '400px' }}>
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              style={{ background: '#fff', color: 'var(--primary)', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: '40px', bottom: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color="var(--primary)" />
              </div>
              <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>{s.label}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>How It Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { num: '1', title: 'Share your link', desc: 'Copy your unique referral link and share it with friends' },
            { num: '2', title: 'Friend signs up', desc: 'They create an account using your referral link' },
            { num: '3', title: 'Earn commission', desc: 'Get 30% of all their spending, forever' },
          ].map((step) => (
            <div key={step.num} style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', fontSize: '1rem', fontWeight: 700 }}>
                {step.num}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>{step.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent referrals */}
      <div className="card" style={{ padding: '1.8rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.2rem' }}>Recent Referrals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {[
            { user: 'alice@example.com', date: '2026-05-18', earnings: '12.50 USD' },
            { user: 'bob@company.io', date: '2026-05-17', earnings: '28.00 USD' },
            { user: 'carol.dev@gmail.com', date: '2026-05-15', earnings: '5.00 USD' },
            { user: 'david.tech@outlook.com', date: '2026-05-14', earnings: '18.75 USD' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-dark)' }}>{r.user}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>{r.date}</div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success)' }}>+{r.earnings}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
