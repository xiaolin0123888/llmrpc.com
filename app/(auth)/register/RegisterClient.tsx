'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref') || ''

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_REGEX.test(form.email)) { setError('Invalid email format'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (!agree) { setError('Please agree to the Terms of Service and Privacy Policy'); return }
    setError('')
    setLoading(true)
    try {
      const body: any = { email: form.email, password: form.password }
      if (referralCode) body.ref = referralCode

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      setRegistered(true)
      setRegisteredEmail(form.email)
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111111', background: '#ffffff', outline: 'none', boxSizing: 'border-box' as const }

  if (registered) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: '#f5f5f5', padding: '1rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111111', marginBottom: '12px' }}>Check your inbox!</div>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginBottom: '24px' }}>
            We've sent a verification link to <strong>{registeredEmail}</strong>. Click the link to verify your email and receive <strong style={{ color: '#2563eb' }}>100,000 free credits</strong>.
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
            The verification link expires in 24 hours. If you don't see the email, check your spam folder.
          </p>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            Already verified?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: '#f5f5f5', padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        {referralCode && (
          <div style={{ marginBottom: '20px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px', color: '#16a34a' }}>
            🎉 You were invited! Both you and your referrer will get bonus credits.
          </div>
        )}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111111', marginBottom: '4px' }}>Create your account</div>
          <div style={{ fontSize: '14px', color: '#666666' }}>Start using 100+ AI models today</div>
        </div>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px', textAlign: 'left' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '14px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat your password" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: '3px', minWidth: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }} />
            <label style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, cursor: 'pointer', textAlign: 'left' }}>
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>
            </label>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          Already have an account? <Link href="/login" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
