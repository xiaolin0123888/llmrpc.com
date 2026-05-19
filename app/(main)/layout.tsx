'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Key, CreditCard, Users, Settings, Globe } from 'lucide-react'

const MENU = [
  { href: '/(main)/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/(main)/models', label: 'API Keys', icon: Key },
  { href: '/(main)/billing', label: 'Billing', icon: CreditCard },
  { href: '/(main)/referrals', label: 'Referrals', icon: Users },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="side-logo">LLM<span style={{ color: 'var(--primary)' }}>Rpc</span></div>
        <nav className="side-menu">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: '1.5rem', width: 'calc(100% - 3rem)' }}>
          <Link href="/(main)/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-gray)', fontSize: '0.9rem', fontWeight: 500 }}>
            <Settings size={17} /> Settings
          </Link>
          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>xiaolin0123888</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>Free Plan</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-dark)' }}>
            {MENU.find(m => pathname.startsWith(m.href))?.label || 'Dashboard'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" style={{ fontSize: '0.88rem', color: 'var(--text-gray)' }}>← Back to home</a>
            <Link href="/(auth)/login" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 500 }}>Sign out</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
