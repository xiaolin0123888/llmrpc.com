'use client'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: 0, tokens: '100,000', desc: 'Start for free', features: ['100,000 tokens', 'Basic models', '1 workspace'] },
  { name: 'Basic', price: 9, tokens: '1,000,000', desc: 'For personal projects', features: ['1M tokens/month', 'All models', '3 workspaces', 'Email support'] },
  { name: 'Pro', price: 29, tokens: '5,000,000', desc: 'For growing teams', features: ['5M tokens/month', 'All models + priority', '10 workspaces', 'API support'] },
  { name: 'Enterprise', price: 99, tokens: '25,000,000', desc: 'Unlimited scale', features: ['25M tokens/month', 'Dedicated support', 'Unlimited workspaces', 'SLA guarantee'] },
]

export default function Billing() {
  const { data } = useQuery({ queryKey: ['credits'], queryFn: async () => { const r = await fetch('/api/credits'); return r.json() } })

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
            <a href="/billing" className="text-white transition-colors">Billing</a>
            <a href="/referrals" className="hover:text-white transition-colors">Referrals</a>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Billing</h1>
          <p className="text-sm text-zinc-400">Current balance: <span className="text-white font-medium">{(data?.credits || 0).toLocaleString()}</span> tokens</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {PLANS.map(plan => (
            <div key={plan.name} className={`p-6 rounded-xl border ${plan.name === 'Pro' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'} hover:border-white/20 transition-colors`}>
              <p className="text-xs text-zinc-500 mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1"><span className="text-2xl font-semibold">${plan.price}</span><span className="text-zinc-500 text-sm">/mo</span></div>
              <p className="text-xs text-zinc-400 mb-4">{plan.tokens} tokens/mo</p>
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${plan.name === 'Pro' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-white/10 hover:bg-white/5'}`}>{(plan.price === 0) ? 'Current plan' : 'Subscribe'}</button>
            </div>
          ))}
        </div>

        <div className="mb-6"><h2 className="text-lg font-medium mb-4">Transaction History</h2></div>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-left text-xs text-zinc-500"><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Date</th></tr></thead>
            <tbody>
              {(data?.transactions || []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600 text-sm">No transactions yet</td></tr>
              ) : (data?.transactions || []).map((tx: any) => (
                <tr key={tx.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${tx.type.includes('REFERRAL') ? 'bg-emerald-500/20 text-emerald-400' : tx.type === 'USAGE' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>{tx.type.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 font-mono">{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-400">{tx.description}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
