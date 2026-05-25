'use client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => { if (d.name) setName(d.name) })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) setMsg('Profile updated!')
      else setMsg('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Settings</h1>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.2rem' }}>Profile</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '0.4rem' }}>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem', outline: 'none' }} />
        </div>
        {msg && <p style={{ color: msg.includes('update') ? '#16a34a' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{msg}</p>}
        <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ padding: '0.6rem 1.5rem', opacity: loading ? 0.6 : 1 }}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  )
}