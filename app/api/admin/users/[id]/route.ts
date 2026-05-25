import { NextRequest, NextResponse } from 'next/server'
import { getAll, getOne, execute } from '@/lib/db'

function verify(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  try { const p = JSON.parse(Buffer.from(token, 'base64').toString()); return !!(p && p.id) } catch { return false }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const user = await getOne(`
      SELECT u.*, s.status as sub_status, s.plan, s.current_period_end,
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
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const { action, amount } = await req.json()
    if (action === 'toggle_ban') {
      await execute('UPDATE users SET is_banned = NOT is_banned WHERE id = $1', [id])
      return NextResponse.json({ success: true })
    }
    if (action === 'add_credits') {
      if (!amount) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      await execute('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, id])
      await execute(`INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'ADMIN_ADD', $2, $3)`, [id, amount, `Admin added ${amount} credits`])
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[admin user patch]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}