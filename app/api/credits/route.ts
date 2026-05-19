import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, getAll, query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getOne('SELECT credits, referral_code, referral_count FROM users WHERE id = ', [session.user.id])
  const transactions = await getAll('SELECT id, type, amount, description, created_at FROM transactions WHERE user_id =  ORDER BY created_at DESC LIMIT 20', [session.user.id])
  return NextResponse.json({ credits: user?.credits || 0, referralCode: user?.referral_code || '', referralCount: user?.referral_count || 0, transactions })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { amount } = await req.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await query('UPDATE users SET credits = credits +  WHERE id = ', [amount, session.user.id])
    await query('INSERT INTO transactions (user_id, type, amount, description) VALUES (, , , )', [session.user.id, 'PURCHASE', amount, `Purchased ${amount} credits`])
    const user = await getOne('SELECT credits FROM users WHERE id = ', [session.user.id])
    return NextResponse.json({ success: true, credits: user?.credits })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
