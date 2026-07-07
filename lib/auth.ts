import { cookies } from 'next/headers'
import jwt, { type JwtPayload } from 'jsonwebtoken'

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

const JWT_SECRET = getJwtSecret()

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
    const decoded = jwt.verify(token, JWT_SECRET) as RawTokenPayload
    const userId = typeof decoded.userId === 'string'
      ? decoded.userId
      : typeof decoded.id === 'string'
        ? decoded.id
        : null

    if (!userId || typeof decoded.email !== 'string') return null

    return {
      id: userId,
      userId,
      email: decoded.email,
      name: typeof decoded.name === 'string' ? decoded.name : null,
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
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function auth(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null

  const user = verifyToken(token)
  return user ? { user } : null
}
