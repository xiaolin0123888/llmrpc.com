import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    const admin = await getOne('SELECT * FROM admin_users WHERE email = $1', [email])
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const token = Buffer.from(JSON.stringify({ id: admin.id, email: admin.email })).toString('base64')
    return NextResponse.json({ token, email: admin.email })
  } catch (err) {
    console.error('[admin login error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}