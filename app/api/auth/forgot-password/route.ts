import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { safeJson } from '@/lib/safe-json'
import crypto from 'crypto'

const GENERIC_RESPONSE = { message: 'If an account exists, we sent a reset link.' }

export async function POST(req: NextRequest) {
  try {
    const [body, parseError] = await safeJson<{ email?: string }>(req)
    if (parseError) return NextResponse.json(GENERIC_RESPONSE)

    const email = body?.email?.trim().toLowerCase() || ''
    
    if (!email) {
      return NextResponse.json(GENERIC_RESPONSE)
    }

    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 3600000)

      await execute(
        'INSERT INTO password_resets (email, token, expires) VALUES ($1, $2, $3)',
        [email, token, expires]
      )

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      await sendPasswordResetEmail(email, resetUrl)
    }
    
    return NextResponse.json(GENERIC_RESPONSE)
  } catch (err) {
    console.error('[forgot-password error]', err)
    return NextResponse.json(GENERIC_RESPONSE)
  }
}
