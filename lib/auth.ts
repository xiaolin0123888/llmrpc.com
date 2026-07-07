import NextAuth, { type NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getOne, execute } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

interface TokenUser {
  id?: string
  userId?: string
  email: string
  name?: string
}

export function verifyToken(token: string): TokenUser | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as TokenUser
    return payload
  } catch {
    return null
  }
}

export function signToken(payload: TokenUser): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID ?? '', clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '' }),
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? '', clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '' }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getOne('SELECT id, email, name, password FROM users WHERE email = $1', [credentials.email])
        if (!user?.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (!user?.email) return false
      const existing = await getOne('SELECT id FROM users WHERE email = $1', [user.email])
      if (!existing) {
        await execute(
          'INSERT INTO users (email, name, avatar_url, github_id, google_id) VALUES ($1, $2, $3, $4, $5)',
          [user.email, user.name || user.email.split('@')[0], user.image,
           account?.provider === 'github' ? account.providerAccountId : null,
           account?.provider === 'google' ? account.providerAccountId : null]
        )
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token.id) { session.user.id = token.id as string; session.user.userId = token.id as string }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
}

export const auth = async () => await getServerSession(authOptions)
