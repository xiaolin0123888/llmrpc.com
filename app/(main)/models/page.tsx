import { getModels } from '@/lib/models'
import Link from 'next/link'

export default async function ModelsPage() {
  const models = await getModels()
  const categories = [...new Set(models.map(m => m.category))]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Models</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Access {models.length}+ models through a single API</p>

      {categories.map(cat => {
        const catModels = models.filter(m => m.category === cat)
        return (
          <div key={cat} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{cat}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {catModels.map(m => (
                <div key={m.id} className="card" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{m.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(37,99,235,0.1)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{m.provider}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '0.8rem', lineHeight: 1.5 }}>{m.id}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                    <span>Context: {m.contextLen >= 1024 ? `${m.contextLen / 1024}k` : m.contextLen}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem' }}>
        <p style={{ color: 'var(--text-gray)', marginBottom: '1rem' }}>Ready to start?</p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex' }}>Get Your API Key →</Link>
      </div>
    </div>
  )
}