import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://llmrpc.com'
  const publicPages = [
    '',
    '/docs',
    '/models',
    '/billing',
    '/register',
    '/login',
    '/privacy',
    '/terms',
    '/refund',
    '/announcements',
    '/forgot-password',
    '/reset-password',
  ]

  return publicPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' as const : 'monthly' as const,
    priority: path === '' ? 1 : path === '/docs' ? 0.9 : 0.7,
  }))
}
