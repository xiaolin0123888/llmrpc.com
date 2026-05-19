'use client'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Key, Plus, Trash2, Copy, Check, Zap, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface ApiKey {
  id: string
  name: string
  prefix: string
  workspace_id: string | null
  last_used: string | null
  created_at: string
}

interface CreditsData {
  credits: number
  referralCode: string
  referralCount: number
  transactions: any[]
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [newKeyName, setNewKeyName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const { data: keys } = useQuery<ApiKey[]>({ queryKey: ['keys'], queryFn: async () => { const r = await fetch('/api/keys'); return (await r.json()).keys }, initialData: [] })
  const { data: creditsData } = useQuery<CreditsData>({ queryKey: ['credits'], queryFn: async () => { const r = await fetch('/api/credits'); return r.json() }, initialData: { credits: 0, referralCode: '', referralCount: 0, transactions: [] } })

  const createKey = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKeyName }) })
      return r.json()
    },
    onSuccess: () => { setNewKeyName(''); setShowCreate(false); },
  })

  const deleteKey = useMutation({
    mutationFn: async (id: string) => { await fetch('/api/keys?id=' + id, { method: 'DELETE' }) },
    onSuccess: () => {},
  })

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" /></svg>
            <span className="text-lg font-semibold">LLMCluster</span>
          </div>
          <nav className="flex items-center gap-8 text-sm text-zinc-400">
            <a href="/dashboard" className="text-white transition-colors">Dashboard</a>
            <a href="/models" className="hover:text-white transition-colors">Models</a>
            <a href="/billing" className="hover:text-white transition-colors">Billing</a>
            <a href="/referrals" className="hover:text-white transition-colors">Referrals</a>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-sm text-zinc-400">Welcome back, {session?.user?.name || session?.user?.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 p-6 rounded-xl border border-white/10 bg-zinc-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-sm text-zinc-400">Available Credits</p><p className="text-2xl font-semibold">{(creditsData?.credits || 0).toLocaleString()}</p></div>
            </div>
            <div className="flex gap-6 text-xs text-zinc-500">
              <span>Referral code: <span className="text-white font-mono">{(creditsData?.referralCode || '').slice(0, 16)}...</span></span>
              <span>Referrals: <span className="text-white">{creditsData?.referralCount || 0}</span></span>
            </div>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-zinc-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
              <div><p className="text-sm text-zinc-400">API Status</p><p className="text-sm font-medium text-emerald-500">Active</p></div>
            </div>
            <p className="text-xs text-zinc-500">Your API keys are working. Start making requests.</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">API Keys</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />New Key
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 rounded-xl border border-white/10 bg-zinc-950 flex gap-3">
            <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key name (e.g. production)" className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <button onClick={() => createKey.mutate()} disabled={!newKeyName || createKey.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Create</button>
            <button onClick={() => setShowCreate(false)} className="border border-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/5">Cancel</button>
          </div>
        )}

        <div className="space-y-2">
          {(keys || []).length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">No API keys yet. Create one to get started.</div>
          ) : (keys || []).map((k: ApiKey) => (
            <div key={k.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-4">
                <Key className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{k.prefix}...</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{k.last_used ? new Date(k.last_used).toLocaleDateString() : 'Never used'}</span>
                <button onClick={() => deleteKey.mutate(k.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
