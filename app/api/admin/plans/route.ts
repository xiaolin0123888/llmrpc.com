import { NextRequest, NextResponse } from 'next/server'
import { getAll, execute } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { safeJson } from '@/lib/safe-json'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const plans = await getAll('SELECT * FROM plans ORDER BY price ASC')
    // Convert BigInt values to numbers for JSON serialization
    const cleaned = plans.map((p: any) => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price),
      monthly_quota: Number(p.monthly_quota),
      overage_rate: Number(p.overage_rate),
      is_active: p.is_active,
    }))
    return NextResponse.json({ plans: cleaned })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const [body, parseError] = await safeJson<{ name?: string; price?: number; monthly_quota?: number; overage_rate?: number }>(req)
    if (parseError) return parseError

    const { name, price, monthly_quota, overage_rate } = body || {}
    if (!name || price === undefined || !monthly_quota) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await execute('INSERT INTO plans (name, price, monthly_quota, overage_rate) VALUES ($1, $2, $3, $4)', [name, price, monthly_quota, overage_rate ?? 0])
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const [body, parseError] = await safeJson<{ id?: string; name?: string; price?: number; monthly_quota?: number; overage_rate?: number; is_active?: boolean }>(req)
    if (parseError) return parseError

    const { id, name, price, monthly_quota, overage_rate, is_active } = body || {}
    if (!id || !name || price === undefined || !monthly_quota) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await execute('UPDATE plans SET name=$1, price=$2, monthly_quota=$3, overage_rate=$4, is_active=$5 WHERE id=$6', [name, price, monthly_quota, overage_rate, is_active ?? true, id])
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
