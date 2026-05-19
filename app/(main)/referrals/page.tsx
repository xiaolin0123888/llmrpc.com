'use client'
import { useQuery } from '@tanstack/react-query'
import { Gift, Users, Zap, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function Referrals() {
  const { data } = useQuery({ queryKey: ['credits'], queryFn: async () => { const r = await fetch('/api/credits'); return r.json() } })
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(data?.referralCode || ''); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" /></svg>
            <span className="text-lg font-semibold">LLMCluster</span>
          </div>
          <nav className="flex items-center gap-8 text-sm text-zinc-400">
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="/models" className="hover:text-white transition-colors">Models</a>
            <a href="/billing" className="hover:text-white transition-colors">Billing</a>
            <a href="/referrals" className="text-white transition-colors">Referrals</a>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Referral Program</h1>
          <p className="text-sm text-zinc-400">Invite friends and earn 150,000 tokens for each referral who creates an account.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-white/10 bg-zinc-950 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-3" />
            <p className="text-2xl font-semibold mb-1">{data?.referralCount || 0}</p>
            <p className="text-sm text-zinc-500">Friends invited</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-zinc-950 text-center">
            <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
            <p className="text-2xl font-semibold mb-1">{((data?.referralCount || 0) * 150000).toLocaleString()}</p>
            <p className="text-sm text-zinc-500">Tokens earned</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-zinc-950 text-center">
            <Gift className="w-6 h-6 text-amber-500 mx-auto mb-3" />
            <p className="text-2xl font-semibold mb-1">150,000</p>
            <p className="text-sm text-zinc-500">Per referral</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-zinc-950 mb-8">
          <p className="text-sm text-zinc-400 mb-3">Your referral link</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={data?.referralCode ? `https://llmcluster.com/register?ref=${data.referralCode}` : ''} className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono" />
            <button onClick={copy} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">{copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}</button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-medium mb-4">How it works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends who might be interested.' },
              { step: '2', title: 'They register', desc: 'When a friend uses your link to create an account, they get 100,000 free tokens.' },
              { step: '3', title: 'You earn tokens', desc: 'You instantly receive 150,000 tokens credited to your account.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-xs flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                <div><p className="text-sm font-medium mb-0.5">{s.title}</p><p className="text-xs text-zinc-500">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
