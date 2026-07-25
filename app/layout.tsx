import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://llmrpc.com'
const SITE_NAME = 'LLMRpc'
const DESCRIPTION =
  'OpenAI-compatible API gateway. One API key, multiple AI models. Prepaid credits, no per-model billing.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LLMRpc — One API Key, Multiple AI Models',
    template: '%s | LLMRpc',
  },
  description: DESCRIPTION,
  keywords: [
    'AI API gateway',
    'OpenAI compatible API',
    'LLM API',
    'AI proxy',
    'unified AI API',
    'multi-model API',
  ],
  authors: [{ name: 'LLMRpc' }],
  creator: 'LLMRpc',
  publisher: 'LLMRpc',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'LLMRpc — One API Key, Multiple AI Models',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMRpc — One API Key, Multiple AI Models',
    description: DESCRIPTION,
    creator: '@llmrpc',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'LLMRpc',
              url: SITE_URL,
              description: DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/models?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
