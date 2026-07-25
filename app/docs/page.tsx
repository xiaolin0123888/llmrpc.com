import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Docs — Quick Start',
  description: 'Get started with LLMRpc in 2 minutes. One API key for 100+ AI models. OpenAI-compatible endpoint.',
  openGraph: {
    title: 'LLMRpc Docs — Quick Start',
    description: 'Get started with LLMRpc in 2 minutes. One API key for 100+ AI models.',
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

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#374151' }}>
    {children}
  </h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '0.75rem' }}>{children}</p>
)

const CURL_EXAMPLE = `curl https://llmrpc.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $LLMRPC_API_KEY" \\
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`

const PYTHON_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    base_url="https://llmrpc.com/v1",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`

const NODE_EXAMPLE = `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://llmrpc.com/v1',
  apiKey: process.env.LLMRPC_API_KEY,
})

const response = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [{ role: 'user', content: 'Hello!' }],
})

console.log(response.choices[0].message.content)`

const MODELS_LIST = `# Same endpoint, same key — just change the model name
gpt-5.5              # OpenAI GPT-5.5
claude-opus-4.7      # Anthropic Claude Opus 4.7
claude-sonnet-4.6    # Anthropic Claude Sonnet 4.6
gemini-3.5           # Google Gemini 3.5
deepseek-v3          # DeepSeek V3
deepseek-r2          # DeepSeek R2 (reasoning)
qwen3                # Alibaba Qwen3
glm-5                # Zhipu GLM-5
mistral-medium-3.5   # Mistral Medium 3.5`

const MIGRATION_EXAMPLE = `# 1. Change the base URL
#    https://openrouter.ai/api/v1  ->  https://llmrpc.com/v1

# 2. Change the Authorization header
#    Authorization: Bearer sk-or-v1-...  ->  Authorization: Bearer sk-llm-...`

const plans = [
  { name: 'Free', price: '$0', quota: '500K tokens/mo', color: '#6b7280' },
  { name: 'Basic', price: '$9.99', quota: '500K tokens/mo', color: '#2563eb' },
  { name: 'Pro', price: '$49', quota: '20M tokens/mo', color: '#7c3aed' },
  { name: 'Enterprise', price: '$99', quota: '50M tokens/mo', color: '#059669' },
  { name: 'Unlimited', price: '$199', quota: 'Unlimited', color: '#dc2626' },
]

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Quick Start
      </h1>
      <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Go from zero to your first API call in under 2 minutes.
      </p>

      <H2>1. Create an account</H2>
      <P>
        <Link href="/register" style={{ color: '#2563eb' }}>Sign up for free</Link> —
        you will get <strong>1,000,000 free tokens</strong> to start. No credit card required.
      </P>

      <H2>2. Generate an API key</H2>
      <P>
        Go to <Link href="/settings/keys" style={{ color: '#2563eb' }}>Settings → API Keys</Link> and
        click "Create Key". Copy it — you will only see it once.
      </P>

      <H2>3. Make your first request</H2>
      <P>
        LLMRpc is fully OpenAI-compatible. Replace the base URL and API key — everything else stays the same.
      </P>

      <H3>cURL</H3>
      <CodeBlock code={CURL_EXAMPLE} />

      <H3>Python</H3>
      <CodeBlock code={PYTHON_EXAMPLE} />

      <H3>Node.js</H3>
      <CodeBlock code={NODE_EXAMPLE} />

      <H2>Switch models instantly</H2>
      <P>
        Change one string to use any model. No new API keys, no new billing.
      </P>
      <CodeBlock code={MODELS_LIST} />
      <p style={{ marginTop: '1rem' }}>
        <Link href="/models" style={{ color: '#2563eb' }}>View all 100+ models →</Link>
      </p>

      <H2>Pricing</H2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{plan.quota}</div>
          </div>
        ))}
      </div>
      <P>
        Pay-as-you-go credits also available.{' '}
        <Link href="/billing" style={{ color: '#2563eb' }}>See full pricing →</Link>
      </P>

      <H2>Switching from OpenRouter?</H2>
      <P>Same API format. Two things to change:</P>
      <CodeBlock code={MIGRATION_EXAMPLE} />

      <div style={{
        marginTop: '3rem', padding: '1.25rem', background: '#f0fdf4',
        borderRadius: 8, border: '1px solid #bbf7d0',
      }}>
        <strong style={{ color: '#166534' }}>Free 1,000,000 tokens</strong>
        <span style={{ color: '#166534' }}> on signup. No time limit. </span>
        <Link href="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
          Get started →
        </Link>
      </div>
    </main>
  )
}
