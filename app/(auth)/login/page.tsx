'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#6366f1"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[#8888a0] mt-2">Sign in to your account</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8888a0] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#555]" />
            </div>
            <div>
              <label className="block text-xs text-[#8888a0] mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#555]" />
            </div>
            {error && <p className="text-xs text-[#ef4444]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#6366f1] hover:bg-[#818cf8] disabled:opacity-50 text-white py-2.5 rounded-md text-sm font-medium transition-colors">
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8888a0] mt-6">
          Don&apos;t have an account? <Link href="/register" className="text-[#6366f1] hover:text-[#818cf8]">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
