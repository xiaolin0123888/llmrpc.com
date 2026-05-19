'use client'
import { useQuery } from '@tanstack/react-query'
import { Search, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Model {
  id: string
  name: string
  provider: string
  description: string
  contextLen: number
  inputPrice: number
  outputPrice: number
  modalities: string[]
  category: string
}

const PROVIDERS = ['All', 'Qwen', 'DeepSeek', 'GLM', 'Mistral', 'InternLM', 'Yi', 'SDXL']
const CATEGORIES = ['All', 'Text Generation', 'Coding', 'Embeddings', 'Image Generation']

function ModelCard({ model }: { model: Model }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(model.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="p-5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 mb-1">{model.provider}</p>
          <h3 className="text-sm font-medium mb-1">{model.name}</h3>
          <p className="text-xs text-zinc-600 font-mono">{model.id}</p>
        </div>
        <button onClick={copy} className="text-zinc-600 hover:text-white transition-colors p-1">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">{model.category}</span>
        <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">{model.contextLen >= 1000 ? Math.round(model.contextLen/1024) + 'K ctx' : model.contextLen}</span>
        {model.modalities.map(m => <span key={m} className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">{m}</span>)}
      </div>
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>Input: <span className="text-zinc-300">${model.inputPrice}/M</span></span>
        <span>Output: <span className="text-zinc-300">${model.outputPrice}/M</span></span>
      </div>
    </div>
  )
}

export default function Models() {
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('All')
  const [category, setCategory] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/models')
      const d = await res.json()
      return d.models as Model[]
    },
  })

  const filtered = (data || []).filter((m: Model) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
    const matchProvider = provider === 'All' || m.provider === provider
    const matchCategory = category === 'All' || m.category === category
    return matchSearch && matchProvider && matchCategory
  })

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
            <a href="/models" className="text-white transition-colors">Models</a>
            <a href="/billing" className="hover:text-white transition-colors">Billing</a>
            <a href="/referrals" className="hover:text-white transition-colors">Referrals</a>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Model Catalog</h1>
          <p className="text-sm text-zinc-400">Browse and select from 100+ available models. All accessible via unified OpenAI-compatible API.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="flex gap-2">
            <select value={provider} onChange={e => setProvider(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button onClick={() => { setProvider('All'); setCategory('All') }} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${provider === 'All' && category === 'All' ? ' bg-white text-black border-white' : ' border-white/10 text-zinc-400 hover:border-white/20'}`}>All Models</button>
          {PROVIDERS.filter(p => p !== 'All').map(p => (
            <button key={p} onClick={() => setProvider(p)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${provider === p ? ' bg-white text-black border-white' : ' border-white/10 text-zinc-400 hover:border-white/20'}`}>{p}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-xl bg-zinc-900/50 animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-4">{filtered.length} models</p>
            <div className="grid md:grid-cols-3 gap-4">
              {filtered.map((m: Model) => <ModelCard key={m.id} model={m} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
