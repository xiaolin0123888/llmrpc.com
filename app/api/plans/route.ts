import { NextResponse } from 'next/server'
import { getAll } from '@/lib/db'

export async function GET() {
  try {
    const plans = await getAll('SELECT id, name, price, monthly_quota, overage_rate FROM plans WHERE is_active = true ORDER BY price ASC')
    // Convert BigInt values to numbers for JSON serialization
    const cleaned = plans.map((p: any) => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price),
      monthly_quota: Number(p.monthly_quota),
      overage_rate: Number(p.overage_rate),
    }))
    return NextResponse.json({ plans: cleaned })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}
