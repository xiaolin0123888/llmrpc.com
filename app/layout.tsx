import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLMRpc - Global AI API Gateway',
  description: 'Access 100+ AI models through a single, unified API. Prepaid credits and subscription plans.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}