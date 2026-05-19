'use client'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { email, password, callbackUrl: '/dashboard', redirect: false })
      if (res?.error) setError('Invalid email or password')
      else window.location.href = res?.url || '/dashboard'
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" /></svg>
          <span className="text-lg font-semibold">LLMCluster</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold mb-4">Unified AI API Access</h2>
          <p className="text-zinc-400 leading-relaxed">Access 100+ AI models through a single, OpenAI-compatible API. Prepaid credits, subscriptions, and referral rewards.</p>
        </div>
        <p className="text-xs text-zinc-600">Powered by SiliconFlow</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-8"><ArrowLeft className="w-4 h-4" />Back to home</Link>
          <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
          <p className="text-sm text-zinc-400 mb-8">New to LLMCluster? <Link href="/register" className="text-blue-500 hover:underline">Create an account</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="Enter your password" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
