import { NextRequest, NextResponse } from 'next/server'
import { getAll, getOne, execute, prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { safeJson } from '@/lib/safe-json'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const { id } = await params
    const user = await getOne(`
      SELECT u.id, u.email, u.name, u.credits, u.is_banned, u.is_admin, u.role,
             u.created_at, u.updated_at, u.referral_code, u.referral_count,
             u.referred_by, u.avatar_url, u.plan_name, u.quota_reset_at,
             u.monthly_used::int as monthly_used,
             s.status as sub_status, s.plan, s.current_period_end,
             COUNT(a.id)::int as key_count
      FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id
                   LEFT JOIN api_keys a ON a.user_id = u.id
      WHERE u.id = $1 GROUP BY u.id, s.status, s.plan, s.current_period_end
    `, [id])
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const [keys, txs] = await Promise.all([
      getAll('SELECT id, name, prefix, last_used, created_at FROM api_keys WHERE user_id = $1', [id]),
      getAll('SELECT id, type, amount, description, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [id]),
    ])
    return NextResponse.json({ user, keys, transactions: txs })
  } catch (err) {
    console.error('[admin user detail]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const { id } = await params
    const [body, parseError] = await safeJson<{ action?: string; amount?: number }>(req)
    if (parseError) return parseError

    const { action, amount } = body || {}
    if (action === 'toggle_ban') {
      const updated = await execute('UPDATE users SET is_banned = NOT is_banned WHERE id = $1', [id])
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }
    if (action === 'add_credits') {
      const creditAmount = amount
      if (typeof creditAmount !== 'number' || !Number.isSafeInteger(creditAmount) || creditAmount <= 0 || creditAmount > 10_000_000) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      const updated = await prisma.$transaction(async (tx) => {
        const users: Array<{ id: string }> = await tx.$queryRawUnsafe(
          'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING id',
          creditAmount,
          id
        )
        if (!users.length) return false

        await tx.$executeRawUnsafe(
          "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'ADMIN_ADD', $2, $3)",
          id,
          creditAmount,
          `Admin added ${creditAmount} credits`
        )
        return true
      })
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[admin user patch]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
