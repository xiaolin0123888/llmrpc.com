import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://llmrpc.com'
const SITE_NAME = 'LLMRpc'
const DESCRIPTION = 'One API key for 27+ AI models. OpenAI-compatible, prepaid credits, transparent per-model pricing. DeepSeek, Qwen, GLM, Claude, Gemini, GPT and more.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LLMRpc — One API Key, Every AI Model',
    template: '%s | LLMRpc',
  },
  description: DESCRIPTION,
  keywords: [
    'AI API gateway', 'OpenAI alternative', 'Claude API', 'GPT API',
    'AI model relay', 'OpenRouter alternative', 'LLM API', 'AI proxy',
    'unified AI API', 'multi-model API', 'cheap AI API',
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
    title: 'LLMRpc — One API Key, Every AI Model',
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'LLMRpc — One API Key, Every AI Model',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLMRpc — One API Key, Every AI Model',
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
    creator: '@llmrpc',
  },
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/sitemap.xml`,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
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
              '@type': 'SoftwareApplication',
              name: 'LLMRpc',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Free tier with 500K tokens/month',
              },
              description: 'One API key for 27+ AI models. OpenAI-compatible API with prepaid credits. DeepSeek, Qwen, GLM, Claude, Gemini, GPT and more.',
              url: SITE_URL,
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
