'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    if (!token || !email) { setStatus('error'); setMessage('Invalid link. Please check your email for the correct verification link.'); return }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) { setStatus('success'); setMessage(data.message || 'Email verified!') }
        else { setStatus('error'); setMessage(data.error || 'Verification failed.') }
      })
      .catch(() => { setStatus('error'); setMessage('Network error. Please try again.') })
  }, [searchParams])

  if (status === 'loading') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>Verifying your email...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>Please wait, this only takes a moment.</div>
    </div>
  )

  if (status === 'success') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>Email Verified!</div>
      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '24px', lineHeight: 1.6 }}>{message}</div>
      <a href="/login" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '11px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Sign in to start using LLMRpc</a>
    </div>
  )

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>Verification Failed</div>
      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '24px', lineHeight: 1.6 }}>{message}</div>
      <a href="/register" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '11px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Create a new account</a>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: '#f5f5f5', padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Suspense fallback={<div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px' }}>⏳</div><div style={{ fontSize: '14px', color: '#666' }}>Loading...</div></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
