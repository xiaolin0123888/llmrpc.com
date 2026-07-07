'use client'
import { useEffect, useState } from 'react'
export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState<any>(null)
  const [form, setForm] = useState({ name: '', price: '', monthly_quota: '', overage_rate: '0' })
  const [saving, setSaving] = useState(false)
  const fetchPlans = async () => {
    const res = await fetch('/api/admin/plans')
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json(); setPlans(data.plans); setLoading(false)
  }
  useEffect(() => { fetchPlans() }, [])
  const openAdd = () => { setEditPlan(null); setForm({ name: '', price: '', monthly_quota: '', overage_rate: '0' }); setShowModal(true) }
  const openEdit = (p: any) => { setEditPlan(p); setForm({ name: p.name, price: String(p.price), monthly_quota: String(p.monthly_quota), overage_rate: String(p.overage_rate ?? '0') }); setShowModal(true) }
  const handleSave = async () => {
    setSaving(true)
    const url = '/api/admin/plans'
    const method = editPlan ? 'PUT' : 'POST'
    const body = editPlan ? { ...form, id: editPlan.id, is_active: true } : form
    await fetch(url)
    setShowModal(false); fetchPlans(); setSaving(false)
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Plans</h1>
        <button onClick={openAdd} style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>+ Add Plan</button>
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {plans.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0', position: 'relative' }}>
              {!p.is_active && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.7rem', background: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: 4 }}>Inactive</span>}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{p.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginBottom: '0.5rem' }}>${Number(p.price).toFixed(2)}<span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>/mo</span></div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{Number(p.monthly_quota).toLocaleString()} credits/month</div>
              <button onClick={() => openEdit(p)} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 400 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>{editPlan ? 'Edit Plan' : 'Add Plan'}</h2>
            {[['name', 'Plan Name'], ['price', 'Price ($)'], ['monthly_quota', 'Monthly Credits'], ['overage_rate', 'Overage Rate']].map(([k, l]) => (
              <div key={k} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.3rem' }}>{l}</label>
                <input type={['price', 'monthly_quota', 'overage_rate'].includes(k) ? 'number' : 'text'} value={(form as any)[k]} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} style={{ width: '100%', padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}