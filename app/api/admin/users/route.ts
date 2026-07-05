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
    const search = searchParams.get('search') ?? ''
    const params: any[] = []
    let where = ''
    if (search) { params.push(`%${search}%`); where += ` AND (u.email ILIKE $${params.length} OR u.name ILIKE $${params.length})` }
    const countRow = await getOne(`SELECT COUNT(*)::int as total FROM users u WHERE 1=1 ${where}`, params)
    const users = await getAll(`
      SELECT u.id, u.email, u.name, u.credits, u.is_banned, u.created_at,
             s.status as sub_status, COUNT(a.id)::int as key_count
      FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id
                   LEFT JOIN api_keys a ON a.user_id = u.id
      WHERE 1=1 ${where}
      GROUP BY u.id, u.email, u.name, u.credits, u.is_banned, u.created_at, s.status
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])
    return NextResponse.json({ users, total: countRow?.total ?? 0, page, limit })
  } catch (err) {
    console.error('[admin users]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
