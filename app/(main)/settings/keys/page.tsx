'use client'
import { useEffect, useState } from 'react'

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [revealed, setRevealed] = useState<Record<string, string>>({})

  const fetchKeys = async () => {
    const res = await fetch('/api/keys')
    const data = await res.json()
    setKeys(data.keys ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (res.ok && data.key) {
        setRevealed(r => ({ ...r, [data.key_id]: data.key }))
      }
      setName('')
      fetchKeys()
    } finally {
      setCreating(false)
    }
  }

  const handleReveal = async (keyId: string) => {
    if (revealed[keyId]) { setRevealed(r => { const n = { ...r }; delete n[keyId]; return n }); return }
    const res = await fetch(`/api/keys/reveal?id=${keyId}`)
    const data = await res.json()
    setRevealed(r => ({ ...r, [keyId]: data.key }))
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm('Delete this API key?')) return
    await fetch(`/api/keys?id=${keyId}`, { method: 'DELETE' })
    fetchKeys()
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>API Keys</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', fontSize: '0.875rem' }}>API keys are used to authenticate your requests. Keep them secure.</p>

      {/* Create */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>Create New Key</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Key name (e.g. Production)" style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem', outline: 'none' }} />
          <button type="submit" disabled={creating} className="btn-primary" style={{ padding: '0.65rem 1.5rem', opacity: creating ? 0.6 : 1 }}>{creating ? 'Creating...' : 'Create Key'}</button>
        </form>
      </div>

      {/* Key List */}
      {loading ? <p style={{ color: 'var(--text-gray)' }}>Loading...</p> : keys.length === 0 ? (
        <p style={{ color: 'var(--text-gray)' }}>No API keys yet. Create one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {keys.map(k => (
            <div key={k.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{k.name}</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                  {revealed[k.id] || `${k.prefix}••••••••`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.3rem' }}>
                  Created {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleString()}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleReveal(k.id)} style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg-main)', color: 'var(--text-gray)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {revealed[k.id] ? 'Hide' : 'Reveal'}
                </button>
                <button onClick={() => handleDelete(k.id)} style={{ padding: '0.4rem 0.9rem', border: '1px solid #fecaca', borderRadius: 7, background: 'rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}