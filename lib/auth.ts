import { cookies } from 'next/headers'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { getOne } from '@/lib/db'

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

export interface TokenUser {
  id: string
  userId: string
  email: string
  name?: string | null
}

export interface AuthSession {
  user: TokenUser
}

type RawTokenPayload = JwtPayload & {
  id?: unknown
  userId?: unknown
  email?: unknown
  name?: unknown
}

export function verifyToken(token: string): TokenUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret())
    if (typeof decoded !== 'object' || decoded === null) return null

    const payload = decoded as RawTokenPayload
    const userId = typeof payload.userId === 'string'
      ? payload.userId
      : typeof payload.id === 'string'
        ? payload.id
        : null

    if (!userId || typeof payload.email !== 'string' || !payload.email) return null
    if (payload.name !== undefined && payload.name !== null && typeof payload.name !== 'string') return null

    return {
      id: userId,
      userId,
      email: payload.email,
      name: payload.name ?? null,
    }
  } catch {
    return null
  }
}

export function signToken(payload: Pick<TokenUser, 'userId' | 'email'> & { name?: string | null }): string {
  return jwt.sign(
    {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
      name: payload.name ?? null,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  )
}

export async function auth(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null

  const user = verifyToken(token)
  if (!user) return null

  const account = await getOne<{ is_banned: boolean | null }>(
    'SELECT is_banned FROM users WHERE id = $1',
    [user.userId]
  )
  if (!account || account.is_banned) return null

  return { user }
}
