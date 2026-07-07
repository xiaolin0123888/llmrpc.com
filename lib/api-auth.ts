import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

/**
 * Extract an API key from request headers.
 * Supports: x-api-key header, Authorization: Bearer sk-...
 */
export function extractApiKey(req: Request): string | null {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) return apiKey

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

/**
 * Verify an API key against the database.
 * Returns the key record + user data, or null if invalid.
 */
export async function verifyApiKey(keyValue: string) {
  const hashedKey = crypto.createHash('sha256').update(keyValue).digest('hex')
  return prisma.apiKey.findFirst({
    where: { key: hashedKey },
    include: { user: { select: { id: true, credits: true } } },
  })
}

/**
 * OpenAI-compatible 401 error response.
 */
export function unauthorizedResponse(message?: string) {
  return NextResponse.json(
    {
      error: {
        message: message || 'API key required. Provide via Authorization: Bearer sk-... or x-api-key header.',
        type: 'authentication_error',
      },
    },
    { status: 401 }
  )
}

/**
 * Middleware matcher: return true if the path is an API/JSON route
 * that should never redirect to an HTML login page.
 */
export function isJsonRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/v1/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/.well-known/')
  )
}
