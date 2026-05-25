'use client'
import { useEffect, useState } from 'react'
export default function AdminKeysPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const fetchKeys = async (p = 1, s = search) => {
    const token = localStorage.getItem('admin_token')
    setLoading(true)
    const res = await fetch(`/api/admin/keys?page=${p}&limit=20&search=${encodeURIComponent(s)}`, { headers: { 'x-admin-token': token ?? '' } })
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json()
    setKeys(data.keys); setTotal(data.total); setPage(p); setLoading(false)
  }
  useEffect(() => { fetchKeys() }, [])
  const totalPages = Math.ceil(total / 20)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>API Keys</h1>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total: {total.toLocaleString()}</span>
      </div>
      <form onSubmit={e => { e.preventDefault(); fetchKeys(1, search) }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or key name..." style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: '#fff' }} />
        <button type="submit" style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Search</button>
        <button type="button" onClick={() => { setSearch(''); fetchKeys(1, '') }} style={{ padding: '0.65rem 1rem', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', cursor: 'pointer' }}>Clear</button>
      </form>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>User</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Prefix</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Last Used</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Created</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</td></tr>
             : keys.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No keys found</td></tr>
             : keys.map(k => (
              <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1.2rem', color: '#1e293b', fontWeight: 500 }}>{k.name}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.85rem' }}>{k.email ?? 'N/A'}</td>
                <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{k.prefix}••••••••</td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}</td>
                <td style={{ padding: '0.85rem 1.2rem', color: '#64748b', fontSize: '0.8rem' }}>{new Date(k.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
          <button onClick={() => fetchKeys(page - 1)} disabled={page <= 1} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Prev</button>
          <span style={{ padding: '0.5rem 1rem', color: '#64748b', fontSize: '0.875rem', lineHeight: '2' }}>Page {page} of {totalPages}</span>
          <button onClick={() => fetchKeys(page + 1)} disabled={page >= totalPages} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Next</button>
        </div>
      )}
    </div>
  )
}