'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async (p = 1, s = '') => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${p}&limit=20&search=${encodeURIComponent(s)}`)
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json()
    setUsers(data.users); setTotal(data.total); setPage(p); setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Users</h1>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total: {total.toLocaleString()}</span>
      </div>
      <form onSubmit={e => { e.preventDefault(); fetchUsers(1, search) }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or name..." style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: '#fff' }} />
        <button type="submit" style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Search</button>
        <button type="button" onClick={() => { setSearch(''); fetchUsers(1, '') }} style={{ padding: '0.65rem 1rem', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', cursor: 'pointer' }}>Clear</button>
      </form>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Plan</th>
            <th style={{ textAlign: 'right', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Credits</th>
            <th style={{ textAlign: 'right', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Keys</th>
            <th style={{ textAlign: 'center', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Joined</th>
            <th style={{ textAlign: 'center', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Action</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</td></tr>
             : users.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No users found</td></tr>
             : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1.2rem', color: '#1e293b', fontWeight: 500 }}>{u.email}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{u.sub_status ?? 'FREE'}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{u.credits?.toLocaleString() ?? 0}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748b' }}>{u.key_count}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  {u.is_banned ? <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', background: '#fef2f2', color: '#dc2626' }}>Banned</span>
                   : <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a' }}>Active</span>}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '0.85rem 1.2rem', textAlign: 'center' }}>
                  <Link href={`/admin/users/${u.id}`} style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.8rem', textDecoration: 'none' }}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
          <button onClick={() => fetchUsers(page - 1, search)} disabled={page <= 1} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Prev</button>
          <span style={{ padding: '0.5rem 1rem', color: '#64748b', fontSize: '0.875rem', lineHeight: '2' }}>Page {page} of {totalPages}</span>
          <button onClick={() => fetchUsers(page + 1, search)} disabled={page >= totalPages} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Next</button>
        </div>
      )}
    </div>
  )
}
