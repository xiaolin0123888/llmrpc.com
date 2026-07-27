import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Docs — Quick Start',
  description: 'Get started with LLMRpc in 2 minutes. One API key, 58 models. OpenAI-compatible endpoint.',
  alternates: { canonical: 'https://llmrpc.com/docs' },
  openGraph: {
    title: 'LLMRpc Docs — Quick Start',
    description: 'Get started with LLMRpc in 2 minutes. One API key, 58 models.',
    url: 'https://llmrpc.com/docs',
  },
}

const CodeBlock = ({ code }: { code: string }) => (
  <pre style={{
    background: '#0d1117', color: '#c9d1d9', padding: '1rem 1.25rem',
    borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.65,
    overflowX: 'auto', border: '1px solid #30363d',
    margin: '0.75rem 0',
  }}>
    <code>{code}</code>
  </pre>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
    {children}
  </h2>
)

const S_K = "YOUR_API_KEY"
const CURL = `curl https://llmrpc.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${S_K}" \\
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`

const PYTHON = `from openai import OpenAI

client = OpenAI(
    base_url="https://llmrpc.com/v1",
    api_key="${S_K}"
)

response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`

const NODE = `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://llmrpc.com/v1',
  apiKey: process.env.LLMRPC_API_KEY,
})

const response = await client.chat.completions.create({
  model: 'deepseek-v4-flash',
  messages: [{ role: 'user', content: 'Hello!' }],
})

console.log(response.choices[0].message.content)`

const MODELS_LIST = `# Available models — one endpoint, switch by model name
deepseek-v4-pro   # DeepSeek V4 Pro — flagship
deepseek-r1       # DeepSeek R1 — deep reasoning
qwen3.5-397b      # Qwen3.5 397B — massive capacity
qwen3.5-122b      # Qwen3.5 122B — large-scale
deepseek-v3       # DeepSeek V3.2 — latest V3
qwen3.6-35b       # Qwen3.6 35B — latest gen
qwen3.6-27b       # Qwen3.6 27B — fast & capable
kimi-k2.6         # Kimi K2.6 — comprehensive
nex-n2-pro        # Nex N2 Pro
glm-5.1           # GLM-5.1 — strong mid-tier
deepseek-v4-flash # DeepSeek V4 Flash — ultra-fast
glm-5.2           # GLM-5.2 — budget workhorse
...and 16 more

# View all models and pricing: llmrpc.com/models`

const plans = [
  { name: 'Free', price: '$0', quota: '500K tokens/mo', models: '15 models', color: '#6b7580' },
  { name: 'Basic', price: '$9.99', quota: '500K tokens/mo', models: '35 models', color: '#2563eb' },
  { name: 'Pro', price: '$49', quota: '20M tokens/mo', models: '58 models', color: '#7c3aed' },
  { name: 'Enterprise', price: '$99', quota: '50M tokens/mo', models: 'All models', color: '#059669' },
  { name: 'Unlimited', price: '$199', quota: 'Unlimited', models: 'All models', color: '#dc2626' },
]

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Quick Start
      </h1>
      <p style={{ color: '#6b7580', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Go from zero to your first API call in under 2 minutes.
      </p>

      <H2>1. Create an account</H2>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '0.75rem' }}>
        <Link href="/register" style={{ color: '#2563eb' }}>Sign up for free</Link> — you will
        get <strong>1,000,000 free credits</strong> to start. No credit card required.
      </p>

      <H2>2. Generate an API key</H2>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '0.75rem' }}>
        Go to <Link href="/settings/keys" style={{ color: '#2563eb' }}>Settings → API Keys</Link> and
        click "Create Key". Copy it — you will only see it once.
      </p>

      <H2>3. Make your first request</H2>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '0.75rem' }}>
        LLMRpc uses an OpenAI-compatible API. Replace the base URL and API key.
      </p>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
        cURL
      </h3>
      <CodeBlock code={CURL} />

      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
        Python
      </h3>
      <CodeBlock code={PYTHON} />

      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
        Node.js
      </h3>
      <CodeBlock code={NODE} />

      <H2>Available models</H2>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1rem' }}>
        All models share the same endpoint. Just change the model name to switch.
      </p>
      <CodeBlock code={MODELS_LIST} />
      <p style={{ marginTop: '1rem' }}>
        <Link href="/models" style={{ color: '#2563eb' }}>View all models and pricing →</Link>
      </p>

      <H2>Pricing</H2>
      <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1rem' }}>
        Flat credit-based pricing — no per-model markup surprises.
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem', marginTop: '1rem',
      }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: plan.color }}>{plan.name}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
              {plan.price}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9ca3af' }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7580' }}>{plan.quota}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{plan.models}</div>
          </div>
        ))}
      </div>
      <p style={{ color: '#6b7580', fontSize: '0.85rem', marginTop: '0.75rem' }}>
        Prepaid credits also available via PayPal.{' '}
        <Link href="/billing" style={{ color: '#2563eb' }}>See full pricing →</Link>
      </p>

      <div style={{
        marginTop: '3rem', padding: '1.25rem', background: '#f0fdf4',
        borderRadius: 8, border: '1px solid #bbf7d0',
      }}>
        <strong style={{ color: '#166534' }}>1,000,000 free credits</strong>
        <span style={{ color: '#166534' }}> on signup. No time limit. </span>
        <Link href="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
          Get started →
        </Link>
      </div>
    </main>
  )
}
