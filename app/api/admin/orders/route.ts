import { NextRequest, NextResponse } from 'next/server'
import { getAll, getOne } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const offset = (page - 1) * limit
    const status = searchParams.get('status') ?? ''
    const params: any[] = []

    // Build UNION query from both orders and transactions (PayPal purchases)
    let statusFilter = ''
    if (status) {
      params.push(status)
      statusFilter = `WHERE status = $${params.length}`
    }

    const countRow = await getOne(`
      SELECT COUNT(*)::int as total FROM (
        SELECT o.id FROM orders o WHERE 1=1 ${status ? `AND o.status = $1` : ''}
        UNION ALL
        SELECT t.id FROM transactions t
        WHERE t.type = 'PURCHASE'
        ${status ? `AND (CASE WHEN $1 = 'pending' THEN t.metadata::jsonb->>'status' = 'pending' WHEN $1 = 'completed' THEN t.metadata::jsonb->>'status' = 'completed' WHEN $1 = 'refunded' THEN t.metadata::jsonb->>'status' = 'refunded' END)` : ''}
      ) sub
    `, params)

    const orders = await getAll(`
      SELECT * FROM (
        SELECT o.id, o.plan_name, o.amount, o.status, o.created_at, u.email, 'order' as source
        FROM orders o LEFT JOIN users u ON o.user_id = u.id
        UNION ALL
        SELECT t.id, 'Credits' as plan_name, t.amount, COALESCE(t.metadata::jsonb->>'status', 'pending') as status, t.created_at, u.email, 'transaction' as source
        FROM transactions t LEFT JOIN users u ON t.user_id = u.id
        WHERE t.type = 'PURCHASE'
      ) combined
      ${statusFilter}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])

    return NextResponse.json({ orders, total: countRow?.total ?? 0, page, limit })
  } catch (err) {
    console.error('[admin orders]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
