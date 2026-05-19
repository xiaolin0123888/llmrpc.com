import { NextRequest, NextResponse } from 'next/server'
import { getOne, query } from '@/lib/db'
import bcrypt from 'bcryptjs'

function generateId() {
  return require('crypto').randomUUID().replace(/-/g, '').slice(0, 24)
}

function generateReferralCode() {
  return 'ref_' + require('crypto').randomBytes(12).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, referralCode } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Required' }, { status: 400 })

    const existing = await getOne('SELECT id FROM users WHERE email = ', [email])
    if (existing) return NextResponse.json({ error: 'Email taken' }, { status: 409 })

    let referrerId: string | null = null
    if (referralCode) {
      const r = await getOne('SELECT id FROM users WHERE referral_code = ', [referralCode])
      if (r) referrerId = r.id
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = generateId()
    const refCode = generateReferralCode()

    await query(
      'INSERT INTO users (id, email, password, name, credits, referral_code, referred_by) VALUES (, , , , , , )',
      [userId, email, hashedPassword, name || email.split('@')[0], 100000, refCode, referrerId]
    )

    if (referrerId) {
      await query('UPDATE users SET credits = credits + 150000, referral_count = referral_count + 1 WHERE id = ', [referrerId])
      await query('INSERT INTO transactions (user_id, type, amount, description) VALUES (, , , )', [referrerId, 'REFERRAL_BONUS', 150000, `Referral bonus for inviting ${email}`])
      await query('INSERT INTO referrals (referrer_id, referred_id, reward, status) VALUES (, , , )', [referrerId, userId, 150000, 'CREDITED'])
    }

    await query('INSERT INTO transactions (user_id, type, amount, description) VALUES (, , , )', [userId, 'REGISTER_BONUS', 100000, 'New user registration bonus'])

    return NextResponse.json({ success: true, user: { id: userId, email, name: name || email.split('@')[0] } })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
