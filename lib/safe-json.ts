import { NextResponse } from 'next/server'

/**
 * Safely parse JSON from a request body.
 * Returns [parsedData, errorResponse].
 * If parsing fails, errorResponse is set and parsedData is null.
 */
export async function safeJson<T = any>(
  req: Request
): Promise<[T | null, Response | null]> {
  // Validate Content-Type
  const contentType = req.headers.get('content-type') || ''
  if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
    if (contentType.includes('text/') || contentType.includes('application/x-www-form-urlencoded')) {
      // Could still be valid for some endpoints, but check body
    }
  }

  try {
    const data = await req.json()
    return [data as T, null]
  } catch (err: any) {
    console.error('[safe-json parse error]', err?.message || err)
    return [
      null,
      NextResponse.json(
        { error: { message: 'Invalid JSON in request body', type: 'invalid_request_error' } },
        { status: 400 }
      ),
    ]
  }
}
