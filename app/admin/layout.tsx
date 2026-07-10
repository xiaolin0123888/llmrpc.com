'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Key, CreditCard, Package, Bell, LogOut } from 'lucide-react'

const MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/keys', label: 'API Keys', icon: Key },
  { href: '/admin/orders', label: 'Orders', icon: CreditCard },
  { href: '/admin/plans', label: 'Plans', icon: Package },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false)
      return
    }

    setChecking(true)
    // Verify auth by hitting a lightweight endpoint
    fetch('/api/admin/stats')
      .then(r => {
        if (r.ok) setChecking(false)
        else router.replace('/admin/login')
      })
      .catch(() => router.replace('/admin/login'))
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })
      if (!response.ok) {
        window.alert('Failed to sign out. Please try again.')
        return
      }
      router.replace('/admin/login')
      router.refresh()
    } catch {
      window.alert('Failed to sign out. Please try again.')
    }
  }

  if (pathname === '/admin/login') return <>{children}</>

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <aside style={{
        width: 260, background: '#fff', padding: '1.5rem 1rem',
        position: 'fixed', height: '100vh', boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: '#1e293b', padding: '0 0.5rem' }}>
            LLM<span style={{ color: '#2563eb' }}>Rpc</span>
            <span style={{ fontSize: '0.65rem', background: '#2563eb', color: '#fff', padding: '0.2rem 0.45rem', borderRadius: 4, marginLeft: '0.4rem', fontWeight: 600 }}>Admin</span>
          </div>
        </Link>
        <nav style={{ flex: 1 }}>
          {MENU.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.8rem 1rem', marginBottom: '0.25rem', borderRadius: 8,
                color: isActive ? '#2563eb' : '#64748b',
                background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                fontWeight: isActive ? 600 : 500, fontSize: '0.9rem',
                transition: 'all 0.2s', textDecoration: 'none',
              }}>
                <Icon size={17} /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            padding: '0.8rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            color: '#64748b', background: 'transparent', width: '100%',
            fontWeight: 500, fontSize: '0.9rem', textAlign: 'left',
          }}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
      <div style={{ marginLeft: 260, padding: '2rem 2.5rem', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
