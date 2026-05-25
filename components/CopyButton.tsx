'use client'
import { useState } from 'react'
export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className='btn-primary' style={{ padding: '0.65rem 1.2rem', fontSize: '0.875rem' }}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
