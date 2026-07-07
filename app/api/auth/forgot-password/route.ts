import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    let email = ''
    try {
      const body = await req.json()
      email = body.email || ''
    } catch {
      return NextResponse.json({ message: 'If an account exists, we sent a reset link.' })
    }
    
    if (!email) {
      return NextResponse.json({ message: 'If an account exists, we sent a reset link.' })
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
    
    return NextResponse.json({ message: 'If an account exists, we sent a reset link.' })
  } catch (err) {
    console.error('[forgot-password error]', err)
    return NextResponse.json({ message: 'If an account exists, we sent a reset link.' })
  }
}
