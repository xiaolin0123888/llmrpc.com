import { NextRequest, NextResponse } from 'next/server'
import { getAll } from '@/lib/db'
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
    if (search) { params.push(`%${search}%`); where += ` AND (u.email ILIKE $${params.length} OR a.name ILIKE $${params.length})` }
    const countRow = await getAll(`SELECT COUNT(*)::int as total FROM api_keys a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1 ${where}`, params)
    const keys = await getAll(`
      SELECT a.id, a.name, a.prefix, a.last_used, a.created_at, u.email
      FROM api_keys a LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1 ${where} ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])
    return NextResponse.json({ keys, total: countRow?.[0]?.total ?? 0, page, limit })
  } catch (err) {
    console.error('[admin keys]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
