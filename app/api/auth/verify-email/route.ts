import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const REGISTER_BONUS = 100000
const REFERRAL_BONUS = 150000

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing verification token or email' }, { status: 400 })
    }

    const verified = await prisma.$transaction(async (tx) => {
      // Consuming the token first makes concurrent requests mutually exclusive.
      // If a later statement fails, the transaction rolls the token deletion back.
      const consumed: Array<{ user_id: string }> = await tx.$queryRawUnsafe(
        `DELETE FROM email_verifications ev
         USING users u
         WHERE ev.token = $1
           AND ev.expires_at > NOW()
           AND u.id = ev.user_id
           AND LOWER(u.email) = $2
         RETURNING ev.user_id`,
        token,
        email
      )
      if (!consumed.length) return false

      const users: Array<{ id: string; referred_by: string | null }> = await tx.$queryRawUnsafe(
        'SELECT id, referred_by FROM users WHERE id = $1 LIMIT 1',
        consumed[0].user_id
      )
      const user = users[0]
      if (!user) throw new Error('Verification user no longer exists')

      await tx.$executeRawUnsafe(
        'UPDATE users SET credits = credits + $1 WHERE id = $2',
        REGISTER_BONUS,
        user.id
      )
      await tx.$executeRawUnsafe(
        "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'REGISTER_BONUS', $2, 'Email verified - signup bonus')",
        user.id,
        REGISTER_BONUS
      )

      if (user.referred_by) {
        await tx.$executeRawUnsafe(
          'UPDATE users SET credits = credits + $1, referral_count = referral_count + 1 WHERE id = $2',
          REFERRAL_BONUS,
          user.referred_by
        )
        await tx.$executeRawUnsafe(
          "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'REFERRAL_BONUS', $2, 'Referral reward for inviting user')",
          user.referred_by,
          REFERRAL_BONUS
        )
        await tx.$executeRawUnsafe(
          'INSERT INTO referrals (referrer_id, referred_id, reward, status) VALUES ($1, $2, $3, $4)',
          user.referred_by,
          user.id,
          REFERRAL_BONUS,
          'CREDITED'
        )
      }

      await tx.$executeRawUnsafe('DELETE FROM email_verifications WHERE user_id = $1', user.id)
      return true
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired verification link. Please request a new one.' }, { status: 400 })
    }

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
