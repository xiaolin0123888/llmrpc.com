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
    let where = ''
    if (status) { params.push(status); where += ` AND o.status = $${params.length}` }
    const countRow = await getOne(`SELECT COUNT(*)::int as total FROM orders o WHERE 1=1 ${where}`, params)
    const orders = await getAll(`
      SELECT o.id, o.plan_name, o.amount, o.status, o.created_at, u.email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1 ${where} ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])
    return NextResponse.json({ orders, total: countRow?.total ?? 0, page, limit })
  } catch (err) {
    console.error('[admin orders]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
