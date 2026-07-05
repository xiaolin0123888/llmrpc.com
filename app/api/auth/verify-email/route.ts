import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'

const REGISTER_BONUS = 100000
const REFERRAL_BONUS = 150000

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing verification token or email' }, { status: 400 })
    }

    const record = await getOne(
      "SELECT user_id, expires_at FROM email_verifications WHERE token = $1 AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1",
      [token]
    )
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired verification link. Please request a new one.' }, { status: 400 })
    }

    const user = await getOne('SELECT id, email, credits, referred_by FROM users WHERE id = $1 AND email = $2', [record.user_id, email])
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Credit the signup bonus
    await execute('UPDATE users SET credits = credits + $1 WHERE id = $2', [REGISTER_BONUS, user.id])
    await execute(
      "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'REGISTER_BONUS', $2, 'Email verified - signup bonus')",
      [user.id, REGISTER_BONUS]
    )

    // If user was referred, credit the referrer too
    if (user.referred_by) {
      await execute('UPDATE users SET credits = credits + $1, referral_count = referral_count + 1 WHERE id = $2', [REFERRAL_BONUS, user.referred_by])
      await execute(
        "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'REFERRAL_BONUS', $2, 'Referral reward for inviting user')",
        [user.referred_by, REFERRAL_BONUS]
      )
      // Record the referral
      await execute(
        'INSERT INTO referrals (referrer_id, referred_id, reward, status) VALUES ($1, $2, $3, $4)',
        [user.referred_by, user.id, REFERRAL_BONUS, 'CREDITED']
      )
    }

    // Remove the verification token
    await execute('DELETE FROM email_verifications WHERE user_id = $1', [user.id])

    return NextResponse.json({
      success: true,
      bonus: REGISTER_BONUS,
      message: `Email verified! You've received ${REGISTER_BONUS.toLocaleString()} credits.`,
    })
  } catch (err: any) {
    console.error('[verify-email error]', err?.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
