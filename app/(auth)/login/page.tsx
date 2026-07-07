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

  const handleGitHub = () => {
    window.location.href = '/api/auth/signin/github'
  }
  const handleGoogle = () => {
    window.location.href = '/api/auth/signin/google'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, callbackUrl: '/dashboard' }),
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
          {/* Social logins */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGitHub} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Continue with GitHub
            </button>
            <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2a2a3a]"/></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#111118] text-[#8888a0]">or</span></div>
          </div>

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