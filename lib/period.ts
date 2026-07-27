/**
 * Monthly period renewal.
 * Returns the billing period start for usage tracking.
 *
 * IMPORTANT: This does NOT auto-renew subscriptions.
 * Only PayPal webhook PAYMENT.SALE.COMPLETED extends current_period_end.
 * If the period has expired and no payment was received, the user falls back
 * to FREE tier until a new webhook payment arrives.
 */

import { getOne } from '@/lib/db'

async function getUserSubscription(userId: string): Promise<any | null> {
  return getOne(
    `SELECT id, plan, status, current_period_start, current_period_end
     FROM subscriptions
     WHERE user_id = $1 AND status = 'ACTIVE'
     LIMIT 1`,
    [userId]
  )
}

export async function renewPeriodIfNeeded(userId: string): Promise<Date> {
  const sub = await getUserSubscription(userId)

  if (!sub) {
    // No active subscription — billing period is start of current calendar month
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const now = new Date()
  const periodEnd = new Date(sub.current_period_end)

  if (periodEnd > now) {
    // Still within current period
    return new Date(sub.current_period_start)
  }

  // Period has ended and no payment received.
  // Do NOT auto-renew — PayPal webhook must confirm payment first.
  // Return start of current month as fallback period.
  console.log(`[period] Subscription ${sub.id} for user ${userId} expired — awaiting payment webhook`)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

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
