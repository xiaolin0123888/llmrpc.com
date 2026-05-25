'use client'
import { useEffect, useState } from 'react'
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const statusColors: Record<string, string> = { completed: '#dcfce7', pending: '#fef9c3', refunded: '#fef2f2' }
  const statusTextColors: Record<string, string> = { completed: '#16a34a', pending: '#ca8a04', refunded: '#dc2626' }
  const fetchOrders = async (p = 1, s = status) => {
    const token = localStorage.getItem('admin_token')
    setLoading(true)
    const res = await fetch(`/api/admin/orders?page=${p}&status=${s}`, { headers: { 'x-admin-token': token ?? '' } })
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json()
    setOrders(data.orders); setTotal(data.total); setPage(p); setLoading(false)
  }
  useEffect(() => { fetchOrders() }, [])
  const totalPages = Math.ceil(total / 20)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Orders</h1>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total: {total.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
        {['', 'completed', 'pending', 'refunded'].map(s => (
          <button key={s} onClick={() => { setStatus(s); fetchOrders(1, s) }} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, borderColor: status === s ? '#2563eb' : '#e2e8f0', background: status === s ? '#eff6ff' : '#fff', color: status === s ? '#2563eb' : '#64748b' }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>User</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Plan</th>
            <th style={{ textAlign: 'right', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Amount</th>
            <th style={{ textAlign: 'center', padding: '0.85rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.85rem 1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>Date</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</td></tr>
             : orders.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No orders found</td></tr>
             : orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1.2rem', color: '#475569', fontSize: '0.8rem' }}>#{o.id}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.email ?? 'N/A'}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{o.plan_name ?? 'Credits'}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>${Number(o.amount).toFixed(2)}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', background: statusColors[o.status] ?? '#f1f5f9', color: statusTextColors[o.status] ?? '#64748b' }}>{o.status}</span></td>
                <td style={{ padding: '0.85rem 1.2rem', color: '#64748b', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
          <button onClick={() => fetchOrders(page - 1)} disabled={page <= 1} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Prev</button>
          <span style={{ padding: '0.5rem 1rem', color: '#64748b', fontSize: '0.875rem', lineHeight: '2' }}>Page {page} of {totalPages}</span>
          <button onClick={() => fetchOrders(page + 1)} disabled={page >= totalPages} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#cbd5e1' : '#475569', fontSize: '0.875rem' }}>Next</button>
        </div>
      )}
    </div>
  )
}