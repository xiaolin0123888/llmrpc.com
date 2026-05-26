import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <nav className="navbar">
        <a href="/" className="logo">LLM<span>Rpc</span></a>
        <div className="nav-menu">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/models">Models</Link>
          <Link href="/billing">Pricing</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </nav>
      <main style={{ paddingTop: 72 }}>{children}</main>
    </div>
  )
}