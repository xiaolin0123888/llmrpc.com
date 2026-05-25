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
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const [totalUsers, todayNew, totalRevenue, activeKeys] = await Promise.all([
      getOne('SELECT COUNT(*)::int as c FROM users'),
      getOne('SELECT COUNT(*)::int as c FROM users WHERE created_at >= $1', [new Date(now.getFullYear(), now.getMonth(), now.getDate())]),
      getOne('SELECT COALESCE(SUM(amount), 0)::numeric as t FROM orders WHERE status = $1', ['completed']),
      getOne('SELECT COUNT(*)::int as c FROM api_keys'),
    ])
    const recentOrders = await getAll(`
      SELECT o.id, o.plan_name, o.amount, o.status, o.created_at, u.email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `)
    const revenueByDay = await getAll(`
      SELECT DATE(created_at) as date, SUM(amount) as total FROM orders
      WHERE status = 'completed' AND created_at >= $1 GROUP BY DATE(created_at) ORDER BY date
    `, [thirtyDaysAgo])
    const topUsers = await getAll(`
      SELECT u.id, u.email, u.credits, COUNT(a.id)::int as key_count FROM users u
      LEFT JOIN api_keys a ON a.user_id = u.id GROUP BY u.id ORDER BY u.credits DESC LIMIT 5
    `)
    return NextResponse.json({
      totalUsers: totalUsers?.c ?? 0,
      todayNew: todayNew?.c ?? 0,
      totalRevenue: Number(totalRevenue?.t ?? 0),
      activeKeys: activeKeys?.c ?? 0,
      recentOrders, revenueByDay, topUsers,
    })
  } catch (err) {
    console.error('[admin stats]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}