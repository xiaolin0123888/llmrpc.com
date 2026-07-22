'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        setError('Invalid credentials')
        setLoading(false)
        return
      }
      // Token is set as HttpOnly cookie by the server
      window.location.href = '/admin/dashboard'
    } catch {
      setError('Server error')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', color: '#111111', background: '#ffffff', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5', padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111111', marginBottom: '4px' }}>
            LLM<span style={{ color: '#2563eb' }}>Rpc</span>
            <span style={{ fontSize: '0.55rem', background: '#2563eb', color: '#fff', padding: '0.2rem 0.45rem', borderRadius: 4, marginLeft: '0.4rem', fontWeight: 600, verticalAlign: 'middle', position: 'relative', top: '-3px' }}>Admin</span>
          </div>
          <div style={{ fontSize: '14px', color: '#666666' }}>Sign in to admin panel</div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@llmrpc.com" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required style={inputStyle} />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </div>
  )
}
