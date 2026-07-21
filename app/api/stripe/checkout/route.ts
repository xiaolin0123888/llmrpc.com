import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Stripe payments are temporarily unavailable' }, { status: 503 })
}
