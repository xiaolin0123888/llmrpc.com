import { NextRequest, NextResponse } from 'next/server'
import { POST as proxyPost } from '@/app/api/proxy/route'

export async function POST(req: NextRequest) {
  return proxyPost(req)
}

export async function GET() {
  return NextResponse.json(
    { error: { message: 'Method not allowed. Use POST.', type: 'invalid_request_error' } },
    { status: 405 }
  )
}
