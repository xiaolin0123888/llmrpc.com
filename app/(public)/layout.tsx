import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <nav className="navbar">
        <Link href="/" className="logo">LLM<span>Rpc</span></Link>
        <div className="nav-menu">
          <Link href="/models">Models</Link>
          <Link href="/register">Get Started</Link>
          <Link href="/login">Sign In</Link>
        </div>
      </nav>
      <main style={{ paddingTop: 72 }}>{children}</main>
    </div>
  )
}
