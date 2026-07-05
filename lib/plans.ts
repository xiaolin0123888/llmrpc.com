/**
 * Plans utility - queries the raw SQL `plans` table
 * and provides helpers for plan-related logic.
 */

import { getOne, getAll } from '@/lib/db'

export interface Plan {
  id: number
  name: string
  price: number
  monthly_quota: number   // tokens per month
  overage_rate: number     // USD per 1000 tokens after quota exceeded
  is_active: boolean
  created_at: string
}

// Map subscription plan enum (FREE/BASIC/PRO/ENTERPRISE) to plans table name
export const PLAN_NAME_MAP: Record<string, string> = {
  FREE: 'Basic',      // Free tier gets Basic plan quota (100K)
  BASIC: 'Basic',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
  UNLIMITED: 'Unlimited',
}

export async function getPlanByName(name: string): Promise<Plan | null> {
  return getOne('SELECT * FROM plans WHERE name = $1 AND is_active = true', [name])
}

export async function getAllActivePlans(): Promise<Plan[]> {
  return getAll('SELECT * FROM plans WHERE is_active = true ORDER BY price ASC')
}

export async function getPlanQuotaAndOverage(planName: string): Promise<{ quota: number; overageRate: number }> {
  // Default fallback if no plan found
  const defaultQuota = 100_000
  const defaultOverageRate = 0.001 // $1 per 1K tokens

  const plan = await getPlanByName(PLAN_NAME_MAP[planName] || planName)
  if (!plan) {
    // Treat unknown/unsubscribed users as FREE - 100K quota, no overage
    return { quota: defaultQuota, overageRate: 0 }
  }

  // Unlimited plan: effectively infinite quota
  if (plan.name === 'Unlimited') {
    return { quota: Infinity, overageRate: 0 }
  }

  return { quota: Number(plan.monthly_quota), overageRate: Number(plan.overage_rate) }
}