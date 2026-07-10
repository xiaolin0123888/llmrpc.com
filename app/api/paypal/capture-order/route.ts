import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'PayPal top-ups are temporarily unavailable while payment fulfillment is being hardened.',
    },
    { status: 503, headers: { 'Retry-After': '86400' } }
  )
}
