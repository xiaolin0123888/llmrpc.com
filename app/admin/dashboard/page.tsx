'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch('/api/admin/stats', { headers: { 'x-admin-token': token ?? '' } })
      .then(r => { if (r.status === 401) { window.location.href = '/admin/login'; return }; return r.json() })
      .then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Loading...</div>
  if (!stats) return <div style={{ color: '#ef4444', padding: '2rem' }}>Failed to load</div>

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: '#2563eb' },
    { label: 'Today New', value: stats.todayNew.toLocaleString(), color: '#16a34a' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: '#d97706' },
    { label: 'API Keys', value: stats.activeKeys.toLocaleString(), color: '#7c3aed' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>{c.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Recent Orders</h2>
          {stats.recentOrders.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No orders yet</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Plan</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Status</th>
              </tr></thead>
              <tbody>{stats.recentOrders.map((o: any) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 0', color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.email ?? 'N/A'}</td>
                  <td style={{ padding: '0.6rem 0', color: '#475569' }}>{o.plan_name ?? 'Credits'}</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600 }}>${o.amount}</td>
                  <td style={{ padding: '0.6rem 0' }}><span style={{ padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.75rem', background: o.status === 'completed' ? '#dcfce7' : '#fef9c3', color: o.status === 'completed' ? '#16a34a' : '#ca8a04' }}>{o.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Top Users by Credits</h2>
          {stats.topUsers.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No users yet</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Email</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Credits</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Keys</th>
              </tr></thead>
              <tbody>{stats.topUsers.map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 0', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{u.credits.toLocaleString()}</td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', color: '#64748b' }}>{u.key_count}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}