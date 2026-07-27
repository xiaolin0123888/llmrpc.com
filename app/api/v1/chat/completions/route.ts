import { NextRequest, NextResponse } from 'next/server'

// POST /api/v1/chat/completions – Delegates to /api/proxy
// Using barrel re-export from the proxy route
export { POST } from '@/app/api/proxy/route'

export async function GET() {
  return NextResponse.json(
    { error: { message: 'Method not allowed. Use POST.', type: 'invalid_request_error' } },
    { status: 405 }
  )
}
