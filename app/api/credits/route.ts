
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, getAll, execute } from '@/lib/db'
import { getCurrentPeriodUsage, getUserPlanName } from '@/lib/usage'
import { getPlanQuotaAndOverage } from '@/lib/plans'
import { getDaysRemainingInPeriod } from '@/lib/period'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.userId

    const user = await getOne('SELECT credits, referral_code, referral_count FROM users WHERE id = $1', [userId])
    const transactions = await getAll(
      'SELECT id, type, amount, description, created_at as "createdAt" FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    )
    const used = await getCurrentPeriodUsage(userId)
    const planName = await getUserPlanName(userId)
    const { quota } = await getPlanQuotaAndOverage(planName)
    const daysLeft = await getDaysRemainingInPeriod(userId)

    return NextResponse.json({
      credits: user?.credits ?? 0,
      referralCode: user?.referral_code ?? "",
      referralCount: user?.referral_count ?? 0,
      transactions,
      usage: { used, quota: isFinite(quota) ? quota : -1, daysLeft },
      currentPlan: planName,
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAdmin(req)
  if ("error" in authResult) {
    return authResult.error
  }

  try {
    const { userId, amount } = await req.json()
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    if (!amount || typeof amount !== "number" || amount <= 0 || amount > 10000000) {
      return NextResponse.json({ error: "Invalid amount (1-10000000)" }, { status: 400 })
    }

    await execute("UPDATE users SET credits = credits + $1 WHERE id = $2", [amount, userId])
    await execute(
      "INSERT INTO transactions (user_id, type, amount, description, metadata) VALUES ($1, 'ADMIN_ADD', $2, 'Admin added ' || $2 || ' credits', '{\"method\":\"admin\"}')",
      [userId, amount]
    )

    const user = await getOne("SELECT credits, referral_code, referral_count FROM users WHERE id = $1", [userId])

    return NextResponse.json({ success: true, credits: user?.credits ?? 0 })
  } catch (e: any) {
    console.error("[credits POST error]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
