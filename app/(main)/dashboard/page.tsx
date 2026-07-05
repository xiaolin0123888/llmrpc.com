'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

type Stats = { date: string; api_calls: number; credits_used: string }[]

const RANGES = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>([])
  const [recentTxs, setRecentTxs] = useState<any[]>([])
  const [keys, setKeys] = useState<any[]>([])
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [revealError, setRevealError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [rangeDays, setRangeDays] = useState(7)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/usage/stats?days=${rangeDays}`).then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/keys').then(r => r.json()),
    ]).then(([statsData, txData, creditsData, keysData]) => {
      if (statsData.stats) setStats(statsData.stats)
      if (txData.transactions) setRecentTxs(txData.transactions)
      if (creditsData.credits !== undefined) setCredits(creditsData.credits)
      if (keysData.keys) setKeys(keysData.keys)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [rangeDays])

  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { return () => { if (revealTimer.current) clearTimeout(revealTimer.current) } }, [])

  const handleReveal = async (keyId: string) => {
    if (revealed[keyId]) { setRevealed(r => { const n = { ...r }; delete n[keyId]; return n }); return }
    setRevealError(null)
    const res = await fetch(`/api/keys/reveal?id=${keyId}`)
    const data = await res.json()
    if (data.error) {
      setRevealError(data.error)
      if (revealTimer.current) clearTimeout(revealTimer.current)
      revealTimer.current = setTimeout(() => setRevealError(null), 5000)
      return
    }
    setRevealed(r => ({ ...r, [keyId]: data.key }))
  }

  const formatDate = (d: string) => {
    const datePart = d.split('T')[0] || d
    const [y, m, day] = datePart.split('-').map(Number)
    return `${m}/${day}`
  }

  // Fill in all days in the range with 0 for empty days
  const buildChartData = () => {
    const now = new Date()
    const map = new Map<string, typeof stats[0]>()
    for (const s of stats) {
      const key = (s.date.split('T')[0] || s.date)
      map.set(key, s)
    }
    const result: { date: string; value: number }[] = []
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const row = map.get(key)
      result.push({
        date: row ? formatDate(row.date) : `${d.getMonth()+1}/${d.getDate()}`,
        value: row ? Number(row.credits_used) : 0,
      })
    }
    return result
  }

  const chartData = buildChartData()



  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      {/* Toast notification */}
      {revealError && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 999,
          background: '#dc2626', color: '#fff', borderRadius: 12,
          padding: '0.8rem 1.5rem', fontSize: '0.85rem',
          fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: 500, whiteSpace: 'pre-line',
          animation: 'fadeToast 4.5s ease forwards',
        }}>
          {revealError}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Your account overview</p>
        </div>
        <Link href="/settings/keys" className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
          + Create API Key
        </Link>
      </div>

      {/* Credits Card */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a1a2e 100%)', borderRadius: 16, padding: '2rem 2.5rem', marginBottom: '1.5rem', border: '1px solid #2563eb33' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#93c5fd', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 500 }}>Available Credits</p>
            <p style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{credits.toLocaleString()}</p>
          </div>
          <Link href="/billing" className="btn-primary" style={{ background: '#2563eb', padding: '0.75rem 1.8rem', fontSize: '0.95rem' }}>
            Buy Credits →
          </Link>
        </div>
      </div>

      {/* Usage Chart */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>API Usage</h2>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRangeDays(r.days)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: rangeDays === r.days ? 'var(--primary)' : 'var(--border)',
                  background: rangeDays === r.days ? 'var(--primary)' : 'transparent',
                  color: rangeDays === r.days ? '#fff' : 'var(--text-gray)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', fontSize: '0.875rem' }}>Loading...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-gray)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-gray)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4,4,0,0]} maxBarSize={32} label={({ value, x, y, width }: any) => {
              const v = value as number;
              const label = v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toString();
              return <text x={x + width / 2} y={y - 6} textAnchor="middle" fill="#6b7280" fontSize={11}>{label}</text>;
            }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', fontSize: '0.875rem' }}>No usage data for this period</div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { href: '/models', title: 'Browse Models', desc: 'Explore 100+ AI models', icon: '🤖' },
          { href: '/settings/keys', title: 'API Keys', desc: 'Manage your API keys', icon: '🔑' },
          { href: '/referrals', title: 'Referrals', desc: 'Earn by inviting friends', icon: '🎁' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'block', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{l.icon}</div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{l.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{l.desc}</p>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* API Keys */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>API Keys</h2>
            <Link href="/settings/keys" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>View all →</Link>
          </div>
          {(!keys || keys.length === 0) ? (
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>No API keys yet. <Link href="/settings/keys" style={{ color: 'var(--primary)' }}>Create one</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {keys.map(k => (
                <div key={k.id} style={{ background: 'var(--bg-main)', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{k.name}</div>
                    <button
                      onClick={() => handleReveal(k.id)}
                      style={{ padding: '0.2rem 0.6rem', border: '1px solid var(--border)', borderRadius: 5, background: 'transparent', color: 'var(--text-gray)', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}
                    >
                      {revealed[k.id] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text-gray)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {revealed[k.id] || k.prefix + '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>Recent Activity</h2>
            <Link href="/billing" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>View all →</Link>
          </div>
          {(!recentTxs || recentTxs.length === 0) ? (
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>No recent transactions</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentTxs.slice(0, 5).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>{t.description ?? t.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: Number(t.amount) > 0 ? '#16a34a' : '#dc2626', fontSize: '0.9rem' }}>
                    {Number(t.amount) > 0 ? '+' : ''}{Number(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Code Example */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>Quick Start</h2>
        <div className="code-box">
          <pre style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.7 }}>
{`curl https://llmrpc.com/v1/chat/completions \\
  -H "Authorization: Bearer ***" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
          </pre>
        </div>
      </div>

      <style>{`@keyframes fadeToast {
  0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  70% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}`}</style>
    </div>
  )
}
