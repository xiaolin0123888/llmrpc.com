'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', referralCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      setSuccess(true)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Check className="w-6 h-6 text-emerald-500" /></div>
        <h1 className="text-2xl font-semibold mb-2">Account created</h1>
        <p className="text-zinc-400 mb-8">You have received <span className="text-white font-medium">100,000 free tokens</span>. Welcome to LLMCluster!</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Sign in to continue</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" /></svg>
          <span className="text-lg font-semibold">LLMCluster</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold mb-4">Start building for free</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">Get 100,000 free tokens on registration. Invite friends and earn 150,000 additional tokens for each referral.</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" />100,000 free tokens on signup</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" />150,000 tokens per referral</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" />No credit card required</li>
          </ul>
        </div>
        <p className="text-xs text-zinc-600">Powered by SiliconFlow</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-8"><ArrowLeft className="w-4 h-4" />Back to home</Link>
          <h1 className="text-2xl font-semibold mb-2">Create account</h1>
          <p className="text-sm text-zinc-400 mb-8">Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Sign in</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password <span className="text-zinc-600">(min 8 characters)</span></label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="Create a password" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Referral code <span className="text-zinc-600">(optional)</span></label>
              <input type="text" value={form.referralCode} onChange={e => setForm({...form, referralCode: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="ref_xxxxx" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
