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
 */
export async function getBillingPeriodStart(userId: string): Promise<Date> {
  return renewPeriodIfNeeded(userId)
}

/**
 * Sum total API_USAGE tokens for a user since their billing period start.
 */
export async function getCurrentPeriodUsage(userId: string): Promise<number> {
  const periodStart = await renewPeriodIfNeeded(userId)

  const result: any = await getOne(
    `SELECT COALESCE(SUM(ABS(amount)), 0) as total ` +
    `FROM transactions ` +
    `WHERE user_id = $1 AND type = 'API_USAGE' AND created_at >= $2`,
    [userId, periodStart.toISOString()]
  )

  return parseInt(result?.total || '0', 10)
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
 * Check usage against plan quota.
 * Note: since we now use model-specific credit pricing,
 * this check is for display/overage purposes only.
 * The actual credit deduction happens in the proxy route.
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

  const totalUsed = usedTokens + requestedTokens
  const isOverQuota = usedTokens >= quota
  const excessTokens = Math.max(0, totalUsed - quota)
  const overageCost = (excessTokens / 1000) * overageRate

  // If already over quota and no credits, reject
  if (isOverQuota && userCredits <= 0) {
    return {
      usedTokens, quotaTokens: quota, overageRate,
      isOverQuota: true, excessTokens, overageCost,
      allowedTokens: 0,
    }
  }

  return {
    usedTokens, quotaTokens: quota, overageRate,
    isOverQuota, excessTokens, overageCost,
    allowedTokens: requestedTokens,
  }
}

/**
 * Record API usage transaction with credit-based billing info.
 */
export async function recordUsage(
  userId: string,
  tokenCount: number,
  creditCost: number,
  overageCost: number,
  overageTokens: number,
  model: string,
  description: string
): Promise<void> {
  const meta = JSON.stringify({
    model,
    event: 'api_usage',
    tokens: tokenCount,
    credits_charged: creditCost,
    overage_tokens: overageTokens,
    overage_cost: overageCost,
  })

  await execute(
    'INSERT INTO transactions (user_id, type, amount, description, metadata) ' +
    'VALUES ($1, \'API_USAGE\', $2, $3, $4::jsonb)',
    [userId, -creditCost, description, meta]
  )
}
