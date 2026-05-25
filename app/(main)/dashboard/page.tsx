import { auth } from '@/lib/auth'
import { getOne, getAll } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = session.user.userId

  const [user, keys, recentTxs] = await Promise.all([
    getOne('SELECT * FROM users WHERE id = $1', [userId]),
    getAll('SELECT id, name, prefix, last_used, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]),
    getAll('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]),
  ])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Welcome back, {user?.email}</p>
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
            <p style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{user?.credits?.toLocaleString() ?? 0}</p>
          </div>
          <Link href="/billing" className="btn-primary" style={{ background: '#2563eb', padding: '0.75rem 1.8rem', fontSize: '0.95rem' }}>
            Buy Credits →
          </Link>
        </div>
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
          {keys.length === 0 ? (
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>No API keys yet. <Link href="/settings/keys" style={{ color: 'var(--primary)' }}>Create one</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {keys.map(k => (
                <div key={k.id} style={{ background: 'var(--bg-main)', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{k.name}</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text-gray)', fontSize: '0.8rem' }}>{k.prefix}••••••••</div>
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
          {recentTxs.length === 0 ? (
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>No recent transactions</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentTxs.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>{t.description ?? t.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: t.amount > 0 ? '#16a34a' : '#dc2626', fontSize: '0.9rem' }}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
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
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
          </pre>
        </div>
      </div>
    </div>
  )
}