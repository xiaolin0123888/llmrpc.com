// In-memory sliding window rate limiter per API key
// Does NOT require Redis — suitable for single-server deployment

const WINDOW_MS = 60_000 // 1-minute sliding window

// Map: keyHash -> sorted array of request timestamps
const requestLog = new Map<string, number[]>()

// Per-plan RPM limits
const PLAN_RPM: Record<string, number> = {
  Free: 30,
  Basic: 60,
  Pro: 120,
  Enterprise: 300,
  Unlimited: 600,
}

// Default for unknown plans
const DEFAULT_RPM = 30

export function checkRateLimit(keyHash: string, planName: string): {
  allowed: boolean
  remaining: number
  limit: number
  resetIn: number
} {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const limit = PLAN_RPM[planName] ?? DEFAULT_RPM

  let timestamps = requestLog.get(keyHash) ?? []
  // Prune old entries outside the window
  timestamps = timestamps.filter(t => t > windowStart)

  if (timestamps.length >= limit) {
    const oldest = timestamps[0]!
    const resetIn = Math.ceil((oldest - windowStart) / 1000)
    return { allowed: false, remaining: 0, limit, resetIn }
  }

  timestamps.push(now)
  requestLog.set(keyHash, timestamps)
  return { allowed: true, remaining: limit - timestamps.length, limit, resetIn: 0 }
}

export function rateLimitHeaders(result: ReturnType<typeof checkRateLimit>): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn > 0 ? result.resetIn.toString() : '0',
    'Retry-After': result.resetIn > 0 ? result.resetIn.toString() : '0',
  }
}