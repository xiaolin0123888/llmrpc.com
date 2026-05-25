'use client'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 32px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/" style={{ fontSize: '20px', fontWeight: 700, color: '#111111', textDecoration: 'none' }}>
          LLM<span style={{ color: '#2563eb' }}>Rpc</span>
        </a>
      </nav>
      {children}
    </div>
  )
}