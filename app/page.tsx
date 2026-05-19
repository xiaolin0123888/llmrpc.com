import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Key, CheckCircle2, Zap, ChevronRight, Globe, Cpu, Star } from 'lucide-react'

const PROVIDER_LOGOS = [
  { name: 'Qwen', color: 'bg-orange-500' },
  { name: 'DeepSeek', color: 'bg-blue-600' },
  { name: 'GLM', color: 'bg-blue-500' },
  { name: 'Mistral', color: 'bg-orange-400' },
  { name: 'InternLM', color: 'bg-teal-500' },
  { name: 'Yi', color: 'bg-yellow-500' },
  { name: 'SDXL', color: 'bg-purple-500' },
  { name: 'BAAI', color: 'bg-blue-400' },
]

const STATS = [
  { value: '80T+', label: 'Monthly Tokens' },
  { value: '100K+', label: 'Global Users' },
  { value: '8+', label: 'Providers' },
  { value: '100+', label: 'Models' },
]

const FEATURES = [
  {
    title: 'Higher Availability',
    desc: 'Reliable AI models via distributed infrastructure. Fall back to other providers when one goes down.',
    icon: Shield,
    img: '/api/placeholder/400/200',
  },
  {
    title: 'Price and Performance',
    desc: 'Keep costs in check without sacrificing speed. Edge network for minimal latency.',
    icon: TrendingUp,
    img: '/api/placeholder/400/200',
  },
  {
    title: 'API Key Management',
    desc: 'Create keys, set rate limits, monitor usage. Full control over your API access.',
    icon: Key,
    img: '/api/placeholder/400/200',
  },
]

const STEPS = [
  { num: '1', title: 'Sign Up', desc: 'Create an account to get started. No credit card required.', icon: CheckCircle2 },
  { num: '2', title: 'Buy Credits', desc: 'Credits can be used with any model. No subscriptions required.', icon: Zap },
  { num: '3', title: 'Get Your API Key', desc: 'Create an API key and start making requests. OpenAI compatible.', icon: Key },
]

const CODE = `from openai import OpenAI

client = OpenAI(
    api_key="sk-llmrpc-xxxx",
    base_url="https://api.llmrpc.com/v1"
)

completion = client.chat.completions.create(
    model="Qwen/Qwen2.5-72B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(completion.choices[0].message.content)`

const FOOTER_LINKS = {
  Product: ['Models', 'Rankings', 'Apps', 'Pricing', 'Enterprise'],
  Company: ['About', 'Announcements', 'Careers', 'Privacy', 'Terms'],
  Developer: ['Documentation', 'API Reference', 'SDK', 'Status'],
  Connect: ['Discord', 'GitHub', 'X', 'YouTube'],
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0b]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black text-xs font-bold">LL</span>
              </div>
              <span className="font-semibold text-sm">LLMRpc</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
              <Link href="/models" className="hover:text-white transition-colors">Models</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            The Unified Interface<br />For <span className="text-blue-400">100+ LLMs</span>
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
            Better prices, better uptime, no subscriptions. Access all major AI models through a single, unified API.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Get API Key <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/models" className="inline-flex items-center gap-2 border border-[#333] px-6 py-3 rounded-lg text-sm text-zinc-300 hover:bg-white/5 transition-colors">
              Explore Models
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Logos */}
      <section className="py-12 px-4 border-y border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {PROVIDER_LOGOS.map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] border border-[#222]">
                <div className={`w-5 h-5 rounded-full ${color}`} />
                <span className="text-xs text-zinc-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One API */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One API for Any Model</h2>
            <p className="text-zinc-400 mb-6">
              Access all major models through a single, unified interface. OpenAI SDK works out of the box.
            </p>
            <Link href="/docs" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-[#111] rounded-xl border border-[#1a1a1a] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0b]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-zinc-600 ml-2">python</span>
            </div>
            <pre className="p-5 text-sm text-zinc-300 font-mono overflow-x-auto"><code>{CODE}</code></pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ title, desc, icon: Icon, img }) => (
              <div key={title} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden hover:border-[#2a2a2a] transition-colors">
                <div className="h-40 bg-[#111] flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-zinc-600" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Get started in minutes</h2>
          <p className="text-zinc-400 text-center mb-12">Three simple steps to start building</p>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-4xl font-bold text-zinc-800">{num}</span>
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to ship?</h2>
          <p className="text-zinc-400 mb-8">Get 100,000 free tokens when you create an account. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-12">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-sm mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                <span className="text-black text-[9px] font-bold">LL</span>
              </div>
              <span className="text-sm font-semibold">LLMRpc</span>
            </div>
            <p className="text-xs text-zinc-600">© 2026 LLMRpc. Powered by SiliconFlow.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}