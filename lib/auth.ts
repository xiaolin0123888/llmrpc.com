import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'

export interface TokenUser {
  userId: string
  email: string
  name: string
}

export interface Session {
  user: TokenUser
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const payload = jwt.verify(token, JWT_SECRET) as TokenUser
    return { user: payload }
  } catch { return null }
}