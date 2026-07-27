import Link from 'next/link'
import { MODEL_MAPPING } from '@/lib/models-config'

const PROVIDER: Record<string, string> = {
  'deepseek-ai': 'DeepSeek', 'Pro/deepseek-ai': 'DeepSeek',
  'Qwen': 'Qwen', 'Pro/zai-org': 'GLM', 'zai-org': 'GLM',
  'Pro/moonshotai': 'Kimi', 'moonshotai': 'Kimi',
  'nex-agi': 'Nex', 'Pro/MiniMaxAI': 'MiniMax',
  'ByteDance-Seed': 'ByteDance', 'stepfun-ai': 'StepFun',
  'tencent': 'Tencent', 'inclusionAI': 'InclusionAI',
  'meituan-longcat': 'Meituan',
}

export default function ModelsPage() {
  const models = Object.entries(MODEL_MAPPING)
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Models</h1>
      <p style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
        {models.length} models available. One API endpoint. Flat 1 credit = 1 token across all models.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 0.5rem', color: '#374151' }}>Model ID</th>
              <th style={{ padding: '0.6rem 0.5rem', color: '#374151' }}>Provider</th>
              <th style={{ padding: '0.6rem 0.5rem', color: '#374151' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {models.map(([id, upstream]) => {
              const provider = PROVIDER[upstream.split('/')[0]] || (upstream.startsWith('Pro/') ? PROVIDER[upstream.slice(4).split('/')[0]] || upstream.split('/')[1] : upstream.split('/')[0])
              return (
                <tr key={id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>
                    {id}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                    {provider}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#059669' }}>
                    1 cr / 1K tk
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2rem' }}>
        $1 = 100K credits. All {models.length} models verified against live upstream.{' '}
        <Link href="/docs" style={{ color: '#2563eb' }}>API docs →</Link>
      </p>
    </main>
  )
}
