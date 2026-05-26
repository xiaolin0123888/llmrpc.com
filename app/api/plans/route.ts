import { NextResponse } from 'next/server'
import { getAll } from '@/lib/db'

export async function GET() {
  try {
    const plans = await getAll('SELECT id, name, price, monthly_quota, overage_rate FROM plans WHERE is_active = true ORDER BY price ASC')
    return NextResponse.json({ plans })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}