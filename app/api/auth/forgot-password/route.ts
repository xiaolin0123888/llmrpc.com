import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (!user) return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    await execute(
      'INSERT INTO password_resets (email, token, expires) VALUES ($1, $2, $3)',
      [email, token, expires]
    )

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}