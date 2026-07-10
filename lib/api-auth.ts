import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOne } from '@/lib/db'

export interface ApiKeyRecord {
  id: string
  key_hash: string
  user_id: string
  credits: number
  is_banned: boolean | null
  plan: string
}

/**
 * Extract an API key from request headers.
 * Supports: x-api-key header, Authorization: Bearer sk-...
 */
export function extractApiKey(req: Request): string | null {
  const apiKey = req.headers.get('x-api-key')?.trim()
  if (apiKey) return apiKey

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim()
    return bearerToken || null
  }

  return null
}

/**
 * Verify an API key against the database.
 * Returns the key record + user data, or null if invalid.
 */
export async function verifyApiKey(keyValue: string): Promise<ApiKeyRecord | null> {
  const hashedKey = crypto.createHash('sha256').update(keyValue).digest('hex')
  const record = await getOne<ApiKeyRecord>(
    `SELECT a.id, a.key_hash, a.user_id, u.credits, u.is_banned,
            COALESCE((
              SELECT s.plan::text
              FROM subscriptions s
              WHERE s.user_id = u.id AND s.status = 'ACTIVE'
              ORDER BY s.current_period_end DESC NULLS LAST
              LIMIT 1
            ), 'FREE') AS plan
     FROM api_keys a
     JOIN users u ON u.id = a.user_id
     WHERE a.key_hash = $1`,
    [hashedKey]
  )
  return record && !record.is_banned ? record : null
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
