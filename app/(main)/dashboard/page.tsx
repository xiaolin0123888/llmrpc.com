import Link from 'next/link'
import { Key, TrendingUp, CreditCard, Activity, ArrowRight, Copy } from 'lucide-react'

const API_KEYS = [
  { name: 'Production Key', key: 'sk-llmrpc-xH7kPm9qR2sT3vN5wY8zA', created: '2026-05-19', usage: '12.5M tokens' },
  { name: 'Development Key', key: 'sk-llmrpc-dK4jL8mN1pQ6rS9tU2vW', created: '2026-05-18', usage: '3.2M tokens' },
]

const USAGE_DATA = [
  { label: 'Today', value: '1.2M tokens', percent: 12 },
  { label: 'This Week', value: '8.5M tokens', percent: 35 },
  { label: 'This Month', value: '42.3M tokens', percent: 68 },
]

export default function DashboardPage() {
  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Credits', value: '$48.20', sub: 'Available', icon: CreditCard, color: 'var(--primary)' },
          { label: 'Monthly Usage', value: '42.3M', sub: 'Tokens consumed', icon: TrendingUp, color: 'var(--success)' },
          { label: 'API Keys', value: '2', sub: 'Active keys', icon: Key, color: 'var(--text-dark)' },
          { label: 'Success Rate', value: '99.8%', sub: 'Last 30 days', icon: Activity, color: 'var(--success)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem' }}>{s.label}</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-dark)' }}>{s.value}</div>
            <div style={{ color: 'var(--text-gray)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Usage bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)' }}>Monthly Usage</h3>
          <Link href="/billing" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 500 }}>
            Buy credits <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-card)', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <div style={{ height: '100%', width: '68%', background: 'var(--primary)', borderRadius: '4px' }} />
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-gray)' }}>42.3M / 100M tokens used this month</div>
      </div>

      {/* API Keys */}
      <div className="card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)' }}>API Keys</h3>
          <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}>+ Create Key</button>
        </div>
        {API_KEYS.map((k) => (
          <div key={k.name} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{k.name}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-gray)' }}>{k.key}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{k.usage}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>Created {k.created}</div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}>
                <Copy size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <Link href="/models" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.5rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Manage API Keys</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Create, edit and monitor your API keys</div>
          </div>
          <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-gray)' }} />
        </Link>
        <Link href="/billing" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.5rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Recharge Credits</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Top up your account balance</div>
          </div>
          <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-gray)' }} />
        </Link>
      </div>
    </div>
  )
}
