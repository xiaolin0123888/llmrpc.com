/**
 * Monthly period renewal — now with PayPal payment verification.
 *
 * Key change: subscriptions no longer auto-renew on date alone.
 * If a period expires, the subscription is marked PAST_DUE rather than
 * auto-extended. Only webhook-confirmed payments trigger period renewal.
 */

import { getOne, execute } from '@/lib/db'

/**
 * Get a user's subscription row.
 */
async function getUserSubscription(userId: string): Promise<any | null> {
  return getOne(
    `SELECT id, plan, status, current_period_start, current_period_end
     FROM subscriptions
     WHERE user_id = $1 AND status IN ('ACTIVE', 'PAST_DUE', 'CANCELLING')
     LIMIT 1`,
    [userId]
  )
}

/**
 * Check if a user's subscription period has expired.
 * Returns the current period start, but does NOT auto-renew.
 *
 * If period has ended and no payment event was recorded:
 *   → mark subscription as PAST_DUE (grace period)
 * If PAST_DUE for > 7 days:
 *   → mark as CANCELLED
 */
export async function renewPeriodIfNeeded(userId: string): Promise<Date> {
  const sub = await getUserSubscription(userId)

  if (!sub) {
    // No subscription — billing period is start of current calendar month
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const now = new Date()
  const periodEnd = new Date(sub.current_period_end)

  if (periodEnd > now) {
    // Still within current period
    return new Date(sub.current_period_start)
  }

  // Period ended — check for recent payment events in the window
  const graceWindowStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000) // 1 day before end
  const anyPayment = await getOne(
    `SELECT 1 FROM transactions
     WHERE user_id = $1
       AND type IN ('PAYMENT', 'SUBSCRIPTION_PAYMENT', 'PURCHASE')
       AND created_at >= $2
     LIMIT 1`,
    [userId, graceWindowStart.toISOString()]
  )

  if (anyPayment) {
    // Payment confirmed — extend the period
    const newPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const newPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    await execute(
      `UPDATE subscriptions
       SET current_period_start = $1, current_period_end = $2, status = 'ACTIVE'
       WHERE id = $3`,
      [newPeriodStart.toISOString(), newPeriodEnd.toISOString(), sub.id]
    )

    await execute(
      `INSERT INTO transactions (user_id, type, amount, description, metadata)
       VALUES ($1, 'API_USAGE', 0, 'Billing period renewed (payment verified)',
       $2::jsonb)`,
      [userId, JSON.stringify({
        event: 'period_renewal',
        old_end: periodEnd.toISOString(),
        new_end: newPeriodEnd.toISOString(),
        verified: true,
      })]
    )

    return newPeriodStart
  }

  // No payment — don't auto-renew
  // Check if already PAST_DUE for > 7 days → cancel
  const overdueDays = Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24))

  if (sub.status === 'PAST_DUE' && overdueDays > 7) {
    await execute(
      `UPDATE subscriptions SET status = 'CANCELLED' WHERE id = $1`,
      [sub.id]
    )
    console.log(`[period] Subscription ${sub.id} cancelled after ${overdueDays}d overdue`)
  } else if (sub.status !== 'PAST_DUE') {
    await execute(
      `UPDATE subscriptions SET status = 'PAST_DUE' WHERE id = $1`,
      [sub.id]
    )
    console.log(`[period] Subscription ${sub.id} marked PAST_DUE (${overdueDays}d overdue)`)
  }

  // Return original period start for usage display purposes
  return new Date(sub.current_period_start)
}

/**
 * Get days remaining in current billing period for a user.
 */
export async function getDaysRemainingInPeriod(userId: string): Promise<number> {
  const sub = await getUserSubscription(userId)

  if (!sub) {
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const now = new Date()
  const end = new Date(sub.current_period_end)
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}
