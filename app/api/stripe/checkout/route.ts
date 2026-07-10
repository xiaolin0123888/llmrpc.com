import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This legacy Stripe checkout endpoint is retired because it does not have a safe fulfillment path.',
    },
    { status: 410 }
  )
}
