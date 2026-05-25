import { NextRequest, NextResponse } from 'next/server'
import { getAll, execute } from '@/lib/db'
function verify(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  try { const p = JSON.parse(Buffer.from(token, 'base64').toString()); return !!(p && p.id) } catch { return false }
}
export async function GET(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const plans = await getAll('SELECT * FROM plans ORDER BY price ASC')
    return NextResponse.json({ plans })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function POST(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, price, monthly_quota, overage_rate } = await req.json()
    if (!name || price === undefined || !monthly_quota) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await execute('INSERT INTO plans (name, price, monthly_quota, overage_rate) VALUES ($1, $2, $3, $4)', [name, price, monthly_quota, overage_rate ?? 0])
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
export async function PUT(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, name, price, monthly_quota, overage_rate, is_active } = await req.json()
    await execute('UPDATE plans SET name=$1, price=$2, monthly_quota=$3, overage_rate=$4, is_active=$5 WHERE id=$6', [name, price, monthly_quota, overage_rate, is_active ?? true, id])
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}