import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.JWT_SECRET as string
if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is required for admin authentication')
}

const TOKEN_EXPIRY = '2h'

export type AdminPayload = {
  id: number
  email: string
}

/** Sign a JWT admin token */
export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXPIRY })
}

/** Verify a JWT admin token from request header or cookie. Returns null on failure */
export function verifyAdmin(req: NextRequest): AdminPayload | null {
  const token = req.headers.get('x-admin-token') || getCookie(req, 'admin_token')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, SECRET) as AdminPayload
    return decoded
  } catch {
    return null
  }
}

/** Verify helper for API routes — returns 401 response if invalid */
export function requireAdmin(req: NextRequest): { admin: AdminPayload } | { error: NextResponse } {
  const admin = verifyAdmin(req)
  if (!admin) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { admin }
}

function getCookie(req: NextRequest, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (key === name) {
      try { return decodeURIComponent(val) } catch { return val }
    }
  }
  return null
}
