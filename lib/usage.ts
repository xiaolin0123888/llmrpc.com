/**
 * Usage tracking - calculates current-period usage,
 * checks against plan quota, and computes overage charges.
 */

import { getOne, execute } from '@/lib/db'
import { renewPeriodIfNeeded } from '@/lib/period'
import { getPlanQuotaAndOverage } from '@/lib/plans'

export interface UsageResult {
  usedTokens: number
  quotaTokens: number
  overageRate: number
  isOverQuota: boolean
  excessTokens: number
  overageCost: number
  allowedTokens: number
}

/**
 * Get the billing period start date for a user.
 * Calls renewPeriodIfNeeded which updates the DB if the period has ended.
 */
export async function getBillingPeriodStart(userId: string): Promise<Date> {
  return renewPeriodIfNeeded(userId)
}

/**
 * Sum base API_USAGE tokens for a user since their billing period start,
 * EXCLUDING overage charges which are stored as separate transactions.
 * Overage is tracked independently; including it would double-count costs.
 */
export async function getCurrentPeriodUsage(userId: string): Promise<number> {
  const periodStart = await renewPeriodIfNeeded(userId)

  const result: any = await getOne(
    `SELECT COALESCE(SUM(-amount), 0)::int as total ` +
    `FROM transactions ` +
    `WHERE user_id = $1 AND type = 'API_USAGE' AND created_at >= $2 ` +
    `AND (metadata->>'overage' IS NULL OR NOT (metadata->>'overage')::boolean)`,
    [userId, periodStart]
  )

  const total = Number(result?.total ?? 0); return isNaN(total) ? 0 : total
}

/**
 * Get the user's current plan name from the subscriptions table.
 */
export async function getUserPlanName(userId: string): Promise<string> {
  const sub = await getOne(
    `SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1`,
    [userId]
  )
  return sub?.plan || 'FREE'
}

/**
 * Determine if a token-consuming request is allowed and how to bill it.
 *
 * Returns an UsageResult with:
 * - allowedTokens: tokens the request is permitted to consume
 * - overageCost: USD cost of the NEW overage incurred by this request
 * - isOverQuota: whether user is already over their monthly quota
 * - excessTokens: new tokens exceeding quota (incremental, not cumulative)
 *
 * Core logic (incremental overage):
 * - Overage is calculated only on the portion that crosses the quota line.
 *   If already over quota, only the new request is charged, not the total.
 * - If used + requested <= quota: normal request, no overage
 * - If used < quota but used + requested > quota:
 *     newOverage = (used + requested - quota)
 *     overageCost = newOverage / 1000 * overageRate
 * - If already over quota:
 *     newOverage = requestedTokens (entire request is overage)
 * - Unlimited plan: no quota check, no overage
 */
export async function checkUsage(
  userId: string,
  requestedTokens: number,
  userCredits: number
): Promise<UsageResult> {
  const planName = await getUserPlanName(userId)
  const { quota, overageRate } = await getPlanQuotaAndOverage(planName)
  const usedTokens = await getCurrentPeriodUsage(userId)

  // Unlimited plan: no limits
  if (!isFinite(quota)) {
    return {
      usedTokens, quotaTokens: quota, overageRate: 0,
      isOverQuota: false, excessTokens: 0, overageCost: 0,
      allowedTokens: requestedTokens,
    }
  }

  const isOverQuota = usedTokens >= quota
  // Incremental overage: only the portion of this request that exceeds quota
  const newOverage = Math.max(0, usedTokens + requestedTokens - quota) - Math.max(0, usedTokens - quota)
  const overageCost = (newOverage / 1000) * overageRate

  // If already over quota and not enough credits to cover this request's overage
  if (isOverQuota && overageCost > userCredits) {
    return {
      usedTokens, quotaTokens: quota, overageRate,
      isOverQuota: true, excessTokens: newOverage, overageCost,
      allowedTokens: 0,
    }
  }

  return {
    usedTokens, quotaTokens: quota, overageRate,
    isOverQuota, excessTokens: newOverage, overageCost,
    allowedTokens: requestedTokens,
  }
}

/**
 * Record base usage + any overage charge after a proxy request.
 * The overage cost is stored as a negative amount in tokens (so it's visible in history).
 */
export async function recordUsage(
  userId: string,
  baseTokens: number,
  overageCost: number,
  overageTokens: number,
  model: string,
  description: string
): Promise<void> {
  const meta = JSON.stringify({ model, event: 'api_usage' })
  const desc = description || ('API call: ' + model)

  await execute(
    'INSERT INTO transactions (user_id, type, amount, description, metadata) ' +
    'VALUES ($1, \'API_USAGE\', $2, $3, $4::jsonb)',
    [userId, -baseTokens, desc, meta]
  )

  if (overageCost > 0 && overageTokens > 0) {
    const overageMeta = JSON.stringify({ model, overage: true, overageCost, overageTokens })
    await execute(
      'INSERT INTO transactions (user_id, type, amount, description, metadata) ' +
      'VALUES ($1, \'API_USAGE\', $2, $3, $4::jsonb)',
      [userId, -Math.round(overageCost * 1000),
       ('Overage: ' + overageTokens + ' tokens over quota'), overageMeta]
    )
  }
}
