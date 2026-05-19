import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLMRpc - Global AI API Gateway',
  description: 'Access 100+ AI models through a single, unified API. Prepaid credits and subscription plans.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <a href="/" className="logo">LLM<span>Rpc</span></a>
          <div className="nav-menu">
            <Link href="/(main)/models">Models</Link>
            <Link href="/(main)/billing">Pricing</Link>
            <Link href="/(main)/dashboard">Dashboard</Link>
            <Link href="/(main)/dashboard">Docs</Link>
            <Link href="/(auth)/login" className="btn-outline">Sign In</Link>
            <Link href="/(auth)/register" className="btn-primary">Get Started</Link>
          </div>
        </nav>
        <main style={{ paddingTop: '72px' }}>
          {children}
        </main>
        <footer>
          <div className="footer-inner">
            <div className="footer-col">
              <h4>LLMRpc</h4>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                Global unified AI API gateway. Access 100+ models through a single API endpoint.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/(main)/models">Models</Link>
              <Link href="/(main)/billing">Pricing</Link>
              <Link href="/(main)/dashboard">Dashboard</Link>
              <Link href="/(auth)/register">Get Started</Link>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link href="/(main)/dashboard">Documentation</Link>
              <Link href="/(main)/dashboard">API Reference</Link>
              <Link href="/(main)/dashboard">Status</Link>
              <Link href="/(main)/referrals">Affiliate Program</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/(main)/privacy">Privacy Policy</Link>
              <a href="#">Terms of Service</a>
              <a href="#">Blog</a>
              <a href="#">About</a>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-gray)', fontSize: '0.88rem' }}>
            © 2026 LLMRpc.com. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
