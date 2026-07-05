/**
 * Monthly period renewal.
 * Checks if a subscription's billing period has ended and starts a new one.
 * Called at request time so there's no need for a separate cron.
 */

import { getOne, execute } from '@/lib/db'

/**
 * Get a user's subscription row (raw SQL).
 */
async function getUserSubscription(userId: string): Promise<any | null> {
  return getOne(
    `SELECT id, plan, status, current_period_start, current_period_end
     FROM subscriptions
     WHERE user_id = $1 AND status = 'ACTIVE'
     LIMIT 1`,
    [userId]
  )
}

/**
 * Check if a user's subscription period has expired and needs renewal.
 * If current_period_end < now, the period has ended.
 *
 * Returns the new period start date (either the existing one if still valid,
 * or today if it just expired and a new period should begin).
 */
export async function renewPeriodIfNeeded(userId: string): Promise<Date> {
  const sub = await getUserSubscription(userId)

  if (!sub) {
    // No active subscription - billing period is start of current calendar month
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const now = new Date()
  const periodEnd = new Date(sub.current_period_end)

  if (periodEnd > now) {
    // Still within current period
    return new Date(sub.current_period_start)
  }

  // Period has ended - start a new billing period
  const newPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  await execute(
    `UPDATE subscriptions
     SET current_period_start = $1, current_period_end = $2
     WHERE id = $3`,
    [newPeriodStart, newPeriodEnd, sub.id]
  )

  // Audit trail transaction
  await execute(
    `INSERT INTO transactions (user_id, type, amount, description, metadata)
     VALUES ($1, 'API_USAGE', 0, 'Billing period renewed',
     $2::jsonb)`,
    [userId, JSON.stringify({ event: 'period_renewal', old_end: periodEnd.toISOString(), new_end: newPeriodEnd })]
  )

  return newPeriodStart
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