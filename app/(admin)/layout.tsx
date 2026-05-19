'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Key, CreditCard, Package, Bell, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

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
    const token = localStorage.getItem('admin_token')
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else {
      setChecking(false)
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    router.push('/admin/login')
  }

  if (checking) return null

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 260, background: 'var(--bg-main)', padding: '1.5rem',
        position: 'fixed', height: '100vh', boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2.5rem', color: 'var(--text-dark)' }}>
          LLM<span style={{ color: 'var(--primary)' }}>Rpc</span>
          <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: 4, marginLeft: '0.5rem' }}>Admin</span>
        </div>
        <nav style={{ flex: 1 }}>
          {MENU.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.85rem 1rem', marginBottom: '0.3rem', borderRadius: 8,
                color: isActive ? 'var(--primary)' : 'var(--text-gray)',
                background: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                fontWeight: 500, transition: '0.3s'
              }}>
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.7rem',
          padding: '0.85rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
          color: 'var(--text-gray)', background: 'transparent', width: '100%',
          fontWeight: 500, fontSize: '0.9rem'
        }}>
          <LogOut size={17} /> Sign Out
        </button>
      </aside>

      <div style={{ marginLeft: 260, padding: '2rem 2.5rem', flex: 1, background: 'var(--bg-card)', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
