import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'This legacy models endpoint is retired. Use /v1/models with API key authentication.' },
    { status: 410 }
  )
}
