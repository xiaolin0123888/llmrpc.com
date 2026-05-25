import { NextRequest, NextResponse } from 'next/server'
import { getAll, getOne } from '@/lib/db'
function verify(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  try { const p = JSON.parse(Buffer.from(token, 'base64').toString()); return !!(p && p.id) } catch { return false }
}
export async function GET(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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