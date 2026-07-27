import Link from 'next/link'
import { MODEL_MAPPING } from '@/lib/models-config'

const MODEL_INFO: Record<string, { name: string; desc: string }> = {
  'deepseek-v4-pro':   { name: 'DeepSeek V4 Pro',   desc: 'Flagship performance. Best all-around for complex tasks, coding, analysis.' },
  'deepseek-v4-flash':  { name: 'DeepSeek V4 Flash',  desc: 'Fast and affordable. Perfect for high-volume, low-latency applications.' },
  'deepseek-v3':       { name: 'DeepSeek V3.2',       desc: 'Reliable all-rounder. Strong general-purpose performance.' },
  'deepseek-r1':       { name: 'DeepSeek R1',         desc: 'Deep reasoning model. Step-by-step thinking for math, logic, planning.' },
  'glm-5.2':           { name: 'GLM-5.2',            desc: 'Budget-friendly workhorse. Great for simple chats and prototyping.' },
  'glm-5.1':           { name: 'GLM-5.1',            desc: 'Strong mid-tier model. Balanced speed, quality, and cost.' },
  'qwen3-32b':         { name: 'Qwen3-32B',          desc: 'Balanced mid-size. Great quality-to-cost ratio.' },
  'qwen3.6-27b':       { name: 'Qwen3.6-27B',        desc: 'Fast, capable. Latest Qwen generation.' },
  'qwen3-coder':       { name: 'Qwen3-Coder 30B',    desc: 'Coding specialist. Optimized for code generation and review.' },
  'kimi-k2.6':         { name: 'Kimi K2.6',          desc: 'Latest Kimi. Strong comprehensive performance.' },
}

export default function ModelsPage() {
  const models = Object.keys(MODEL_MAPPING).filter(id => MODEL_INFO[id])

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Models</h1>
      <p style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
        {models.length} models available. One API endpoint, transparent flat pricing.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>Model</th>
              <th style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>Description</th>
              <th style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {models.map((id) => {
              const info = MODEL_INFO[id]
              return (
                <tr key={id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{info.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#9ca3af' }}>{id}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#4b5563', fontSize: '0.85rem' }}>
                    {info.desc}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#059669' }}>
                    1 cr / 1K tokens
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2rem' }}>
        1 credit = 1 token across all models. $1 = 100K credits. All models verified against live upstream. {' '}
        <Link href="/docs" style={{ color: '#2563eb' }}>API docs →</Link>
      </p>
    </main>
  )
}
