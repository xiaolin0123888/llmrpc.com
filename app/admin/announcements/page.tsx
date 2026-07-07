'use client'
import { useEffect, useState } from 'react'
export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '', show_homepage: false })
  const [saving, setSaving] = useState(false)
  const fetchData = async () => {
    const res = await fetch('/api/admin/announcements')
    if (res.status === 401) { window.location.href = '/admin/login'; return }
    const data = await res.json(); setAnnouncements(data.announcements); setLoading(false)
  }
  useEffect(() => { fetchData() }, [])
  const openAdd = () => { setEditItem(null); setForm({ title: '', content: '', show_homepage: false }); setShowModal(true) }
  const openEdit = (a: any) => { setEditItem(a); setForm({ title: a.title, content: a.content, show_homepage: a.show_homepage }); setShowModal(true) }
  const handleSave = async () => {
    setSaving(true)
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { ...form, id: editItem.id } : form
    await fetch('/api/admin/announcements')
    setShowModal(false); fetchData(); setSaving(false)
  }
  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return
    await fetch(`/api/admin/announcements?id=${id}`)
    fetchData()
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Announcements</h1>
        <button onClick={openAdd} style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>+ New Announcement</button>
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : announcements.length === 0 ? <p style={{ color: '#94a3b8' }}>No announcements yet</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 0.3rem' }}>{a.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    {a.show_homepage && <span style={{ background: '#dbeafe', color: '#2563eb', padding: '0.1rem 0.4rem', borderRadius: 4 }}>Homepage</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(a)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(a.id)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.content}</p>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 520 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>{editItem ? 'Edit' : 'New'} Announcement</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.3rem' }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.3rem' }}>Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} style={{ width: '100%', padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="show_homepage" checked={form.show_homepage} onChange={e => setForm(f => ({ ...f, show_homepage: e.target.checked }))} />
              <label htmlFor="show_homepage" style={{ fontSize: '0.875rem', color: '#374151' }}>Show on homepage</label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.content} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: (saving || !form.title || !form.content) ? 'not-allowed' : 'pointer', opacity: (saving || !form.title || !form.content) ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}