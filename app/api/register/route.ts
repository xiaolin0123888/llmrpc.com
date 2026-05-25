import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await getOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const hashed = await bcrypt.hash(password, 12)
    await execute(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
      [email, hashed, email.split('@')[0]]
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[register error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}