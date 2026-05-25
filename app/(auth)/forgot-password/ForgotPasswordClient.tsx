'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setDone(true)
      else { const d = await res.json(); setError(d.error ?? 'Failed') }
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  if (done) return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '2.2rem', width: '100%', maxWidth: 420, textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Check your email</h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>If an account exists, we sent a password reset link.</p>
      <Link href="/login" style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.875rem' }}>Back to Sign In</Link>
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '2.2rem', width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>Forgot Password</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Enter your email to receive a reset link</p>
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.2rem', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}