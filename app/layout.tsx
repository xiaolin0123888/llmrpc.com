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
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: undefined, // set after Google Search Console verification
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
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
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE_URL}/models?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
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
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is LLMRpc?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'LLMRpc is a unified AI API platform that gives you one API key to access 60+ AI models including DeepSeek, Qwen, GLM, Kimi, and more — all OpenAI-compatible.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How much does LLMRpc cost?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'LLMRpc uses a pay-as-you-go credit system. 1 credit = 1 token. $1 = 100,000 credits. All models have the same flat pricing. New users get 1,000,000 free credits on signup.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is LLMRpc compatible with OpenAI API?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. LLMRpc is a drop-in replacement for the OpenAI API. Just change the base URL to https://llmrpc.com/v1 and use your LLMRpc API key. All your existing OpenAI SDK code works unchanged.',
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
