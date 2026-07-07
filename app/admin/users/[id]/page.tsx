'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<any>(null)
  const [keys, setKeys] = useState<any[]>([])
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [creditsAmount, setCreditsAmount] = useState('')
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  const fetchData = async () => {
    const res = await fetch(`/api/admin/users/${id}`)
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setUser(data.user); setKeys(data.keys); setTxs(data.transactions); setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(true)
    await fetch(`/api/admin/users/${id}`)
    setActionLoading(false); setShowCreditsModal(false); setCreditsAmount(''); fetchData()
  }

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Loading...</div>
  if (!user) return <div style={{ color: '#ef4444', padding: '2rem' }}>User not found</div>

  return (
    <div>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>← Back</button>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>{user.email}</h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>ID: {user.id}</span>
              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              <span>Role: {user.role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => handleAction('toggle_ban')} disabled={actionLoading} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: user.is_banned ? '1px solid #16a34a' : '1px solid #dc2626', background: user.is_banned ? '#dcfce7' : '#fef2f2', color: user.is_banned ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{user.is_banned ? 'Unban' : 'Ban'}</button>
            <button onClick={() => setShowCreditsModal(true)} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Credits</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          {[{ label: 'Credits', value: user.credits?.toLocaleString() ?? 0 }, { label: 'API Keys', value: keys.length }, { label: 'Subscription', value: user.sub_status ?? 'FREE' }, { label: 'Status', value: user.is_banned ? 'Banned' : 'Active' }].map(s => (
            <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {showCreditsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 360 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.2rem' }}>Add Credits</h2>
            <input type="number" value={creditsAmount} onChange={e => setCreditsAmount(e.target.value)} placeholder="Enter amount" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreditsModal(false); setCreditsAmount('') }} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleAction('add_credits', { amount: parseInt(creditsAmount) })} disabled={!creditsAmount} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: creditsAmount ? 'pointer' : 'not-allowed', opacity: creditsAmount ? 1 : 0.5 }}>Add</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>API Keys ({keys.length})</h2>
          {keys.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No API keys</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{keys.map(k => (
              <div key={k.id} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', marginBottom: '0.3rem' }}>{k.name}</div>
                <div style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{k.prefix}••••••••</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.3rem' }}>Last used: {k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}</div>
              </div>
            ))}</div>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Recent Transactions</h2>
          {txs.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No transactions</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{txs.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div><div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{t.description ?? t.type}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleDateString()}</div></div>
                <div style={{ fontWeight: 700, color: t.amount > 0 ? '#16a34a' : '#dc2626', fontSize: '0.9rem' }}>{t.amount > 0 ? '+' : ''}{t.amount}</div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  )
}