'use client'
import { useState } from 'react'
import { Key, Copy, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const MODELS = [
  { name: 'GPT-4o', provider: 'OpenAI', price: '$2.5/1M', status: 'online' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', price: '$3/1M', status: 'online' },
  { name: 'Gemini 2.0 Flash', provider: 'Google', price: '$0.1/1M', status: 'online' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', price: '$0.8/1M', status: 'online' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', price: '$0.5/1M', status: 'online' },
  { name: 'GLM-4', provider: 'Zhipu', price: '$0.6/1M', status: 'online' },
  { name: 'Mistral Large', provider: 'Mistral', price: '$2/1M', status: 'online' },
  { name: 'Yi Lightning', provider: '01.AI', price: '$0.9/1M', status: 'online' },
]

const API_KEYS = [
  { name: 'Production', key: 'sk-llmrpc-xH7kPm9qR2sT3vN5wY8zA', created: '2026-05-19', usage: '12.5M', active: true },
  { name: 'Development', key: 'sk-llmrpc-dK4jL8mN1pQ6rS9tU2vW', created: '2026-05-18', usage: '3.2M', active: true },
]

export default function ModelsPage() {
  const [keys, setKeys] = useState(API_KEYS)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState('')

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div>
      {/* API Keys section */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Your API Keys</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem' }}>Keep your keys secure. Do not share them publicly.</p>
          </div>
          <button className="btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.9rem' }}>+ Create New Key</button>
        </div>
        {keys.map((k) => (
          <div key={k.name} style={{ padding: '1.1rem', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)' }}>{k.name}</span>
                <span style={{ fontSize: '0.78rem', padding: '0.2rem 0.7rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Active</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                {showKey[k.key] ? k.key : k.key.slice(0, 20) + '••••••••••••'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                <div>{k.usage} tokens</div>
                <div style={{ fontSize: '0.78rem' }}>{k.created}</div>
              </div>
              <button onClick={() => copyKey(k.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === k.key ? 'var(--success)' : 'var(--text-gray)', display: 'flex', alignItems: 'center' }}>
                {copied === k.key ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
              <button onClick={() => setShowKey(prev => ({ ...prev, [k.key]: !prev[k.key] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)', display: 'flex', alignItems: 'center' }}>
                {showKey[k.key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Models */}
      <div className="card" style={{ padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)' }}>Available Models</h3>
          <input placeholder="Search models..." style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.88rem', outline: 'none', width: '200px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {MODELS.map((m) => (
            <div key={m.name} style={{ padding: '1.2rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)' }}>{m.provider}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-dark)' }}>{m.price}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
