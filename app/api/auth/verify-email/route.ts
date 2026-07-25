import { NextRequest, NextResponse } from 'next/server'
import { getOne, prisma } from '@/lib/db'

const REGISTER_BONUS = 1000000
const REFERRAL_BONUS = 500000

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing verification token or email' }, { status: 400 })
    }

    // Wrap verification + crediting in a single DB transaction to prevent
    // concurrent requests from double-claiming the reward.
    const result = await prisma.$transaction(async (tx) => {
      // Lock the verification row
      const rows: any[] = await tx.$queryRawUnsafe(
        `SELECT user_id, expires_at FROM email_verifications
         WHERE token = $1 AND expires_at > NOW()
         ORDER BY expires_at DESC LIMIT 1
         FOR UPDATE`,
        token
      )
      if (!rows.length) return { error: 'Invalid or expired verification link', status: 400 }

      const record = rows[0]

      // Verify user matches
      const userRows: any[] = await tx.$queryRawUnsafe(
        `SELECT id, email, credits, referred_by FROM users WHERE id = $1 AND email = $2 FOR UPDATE`,
        record.user_id, email
      )
      if (!userRows.length) return { error: 'User not found', status: 404 }

      const user = userRows[0]

      // Check if already verified (bonus already credited)
      const bonusRows: any[] = await tx.$queryRawUnsafe(
        `SELECT id FROM transactions
         WHERE user_id = $1 AND type = 'REGISTER_BONUS' LIMIT 1`,
        user.id
      )
      if (bonusRows.length > 0) {
        // Clean up token and return success (idempotent)
        await tx.$executeRawUnsafe(`DELETE FROM email_verifications WHERE user_id = $1`, user.id)
        return { success: true, bonus: 0, message: 'Email already verified', alreadyVerified: true }
      }

      // Credit signup bonus
      await tx.$executeRawUnsafe(
        `UPDATE users SET credits = credits + $1 WHERE id = $2`,
        REGISTER_BONUS, user.id
      )
      await tx.$executeRawUnsafe(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'REGISTER_BONUS', $2, 'Email verified - signup bonus')`,
        user.id, REGISTER_BONUS
      )

      // If user was referred, credit the referrer too
      if (user.referred_by) {
        await tx.$executeRawUnsafe(
          `UPDATE users SET credits = credits + $1, referral_count = referral_count + 1 WHERE id = $2`,
          REFERRAL_BONUS, user.referred_by
        )
        await tx.$executeRawUnsafe(
          `INSERT INTO transactions (user_id, type, amount, description)
           VALUES ($1, 'REFERRAL_BONUS', $2, 'Referral reward for inviting user')`,
          user.referred_by, REFERRAL_BONUS
        )
        await tx.$executeRawUnsafe(
          `INSERT INTO referrals (referrer_id, referred_id, reward, status)
           VALUES ($1, $2, $3, $4)`,
          user.referred_by, user.id, REFERRAL_BONUS, 'CREDITED'
        )
      }

      // Remove the verification token
      await tx.$executeRawUnsafe(`DELETE FROM email_verifications WHERE user_id = $1`, user.id)

      return {
        success: true,
        bonus: REGISTER_BONUS,
        message: `Email verified! You've received ${REGISTER_BONUS.toLocaleString()} credits.`,
      }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[verify-email error]', err?.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
