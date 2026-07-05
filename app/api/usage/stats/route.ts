import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAll } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '7'), 90)

  const stats = await getAll(
    `SELECT
       DATE(created_at) as date,
       COUNT(*)::int as api_calls,
       COALESCE(SUM(ABS(amount)), 0)::float8 as credits_used
     FROM transactions
     WHERE user_id = $1
       AND type = 'API_USAGE'
       AND created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [session.user.userId]
  )

  return NextResponse.json({ stats })
}