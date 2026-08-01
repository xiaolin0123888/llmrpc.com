import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://llmrpc.com'
const SITE_NAME = 'LLMRpc'
const DESCRIPTION =
  'LLMRpc — Unified AI API platform with 60+ models. One API key for DeepSeek, Qwen, GLM, Kimi & more. OpenAI-compatible. Pay-as-you-go credits. Free 1M tokens on signup.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LLMRpc — One API Key for 60+ AI Models | OpenAI Compatible',
    template: '%s | LLMRpc',
  },
  description: DESCRIPTION,
  keywords: [
    'AI API',
    'AI API gateway',
    'OpenAI compatible API',
    'OpenAI alternative API',
    'LLM API gateway',
    'AI model proxy',
    'DeepSeek API',
    'Qwen API',
    'cheap AI API',
    'unified AI API',
    'multi-model API',
    'ChatGPT API alternative',
    'Claude API alternative',
    'AI API aggregator',
    'GLM API',
    'Kimi API',
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
    title: 'LLMRpc — One API Key for 60+ AI Models | OpenAI Compatible',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMRpc — One API Key for 60+ AI Models | OpenAI Compatible',
    description: DESCRIPTION,
    creator: '@llmrpc',
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
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'LLMRpc',
                url: SITE_URL,
                description: DESCRIPTION,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'LLMRpc',
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'All',
                url: SITE_URL,
                description: DESCRIPTION,
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  description: 'Free 1,000,000 credits on signup',
                },
              },
            ]),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
