import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getOne, execute, prisma } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, getUserPlanName } from '@/lib/usage'
import { MODEL_MAPPING, PLAN_ACCESS, styleModelFilter, injectPersona } from '@/lib/models-config'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate_limit'
import crypto from 'crypto'

const MAX_TOKENS_CAP = 16384
const MAX_THINKING_TOKENS = 32768
const DEFAULT_THINKING_TOKENS = 4096
const MIN_THINKING_TOKENS = 128
const MAX_MESSAGES = 10

function normalizePlanName(raw: string): string {
  const map: Record<string, string> = {
    free: 'Free', basic: 'Basic', pro: 'Pro',
    enterprise: 'Enterprise', unlimited: 'Unlimited',
  }
  return map[raw.toLowerCase()] || 'Free'
}

async function recordUsageInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  baseTokens: number,
  overageCost: number,
  overageTokens: number,
  model: string,
  billingShortfall: boolean
): Promise<void> {
  const meta = JSON.stringify({
    model,
    event: 'api_usage',
    ...(billingShortfall ? { billingShortfall: true } : {}),
  })
  await tx.$executeRawUnsafe(
    `INSERT INTO transactions (user_id, type, amount, description, metadata)
     VALUES ($1, 'API_USAGE', $2, $3, $4::jsonb)`,
    userId,
    -baseTokens,
    `API call: ${model}`,
    meta
  )

  if (!billingShortfall && overageCost > 0 && overageTokens > 0) {
    const overageMeta = JSON.stringify({ model, overage: true, overageCost, overageTokens })
    await tx.$executeRawUnsafe(
      `INSERT INTO transactions (user_id, type, amount, description, metadata)
       VALUES ($1, 'API_USAGE', $2, $3, $4::jsonb)`,
      userId,
      -Math.round(overageCost * 1000),
      `Overage: ${overageTokens} tokens over quota`,
      overageMeta
    )
  }
}

export async function POST(req: NextRequest) {
  let creditsReserved = 0
  let reservationMade = false
  let userId = ''

  try {
    const authHeader = req.headers.get('authorization')
    const apiKey = req.headers.get('x-api-key')
      || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null)
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyRecord: any = await getOne(
      `SELECT a.id, a.key_hash, a.user_id, u.credits, u.is_banned
       FROM api_keys a JOIN users u ON u.id = a.user_id
       WHERE a.key_hash = $1`,
      [hashedKey]
    )
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    if (keyRecord.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    userId = keyRecord.user_id

    const rawPlanName = await getUserPlanName(userId)
    const planName = normalizePlanName(rawPlanName)
    const rateCheck = checkRateLimit(userId, planName)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429, headers: rateLimitHeaders(rateCheck) }
      )
    }

    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const modelId = body.model
    if (!modelId) {
      return NextResponse.json({ error: 'model field required' }, { status: 400 })
    }

    if (!MODEL_MAPPING[modelId]) {
      return NextResponse.json({ error: `Unknown model: ${modelId}` }, { status: 400 })
    }

    const allowedModels = PLAN_ACCESS[planName]
    if (allowedModels && !allowedModels.includes(modelId)) {
      return NextResponse.json(
        { error: `Model ${modelId} not available on your ${planName} plan` },
        { status: 403 }
      )
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'messages must be a non-empty array' }, { status: 400 })
    }

    const siliconModel = MODEL_MAPPING[modelId]
    const messages = injectPersona(modelId, body.messages)

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_MESSAGES} messages per request` },
        { status: 400 }
      )
    }

    if (body.n !== undefined && body.n !== 1) {
      return NextResponse.json(
        { error: 'Only n=1 is supported. Make separate requests for multiple completions.' },
        { status: 400 }
      )
    }
    body.n = 1

    if (
      body.max_tokens !== undefined
      && (!Number.isInteger(body.max_tokens) || body.max_tokens <= 0)
    ) {
      return NextResponse.json({ error: 'max_tokens must be a positive integer' }, { status: 400 })
    }

    const maxOutputTokens = Math.min(body.max_tokens ?? MAX_TOKENS_CAP, MAX_TOKENS_CAP)
    body.max_tokens = maxOutputTokens
    body.stream = false

    if (body.enable_thinking !== undefined && typeof body.enable_thinking !== 'boolean') {
      return NextResponse.json({ error: 'enable_thinking must be a boolean' }, { status: 400 })
    }

    const thinkingEnabled = body.enable_thinking === true
    let thinkingTokensReserved = 0
    if (thinkingEnabled) {
      const requestedThinkingTokens = body.thinking_budget ?? DEFAULT_THINKING_TOKENS
      if (
        !Number.isInteger(requestedThinkingTokens)
        || requestedThinkingTokens < MIN_THINKING_TOKENS
      ) {
        return NextResponse.json(
          { error: `thinking_budget must be an integer of at least ${MIN_THINKING_TOKENS}` },
          { status: 400 }
        )
      }
      thinkingTokensReserved = Math.min(requestedThinkingTokens, MAX_THINKING_TOKENS)
      body.thinking_budget = thinkingTokensReserved
    } else {
      if (body.thinking_budget !== undefined) {
        return NextResponse.json(
          { error: 'enable_thinking must be true when thinking_budget is provided' },
          { status: 400 }
        )
      }
      body.enable_thinking = false
      delete body.reasoning_effort
    }

    const requestBody = { ...body, model: siliconModel, messages }

    // Use one token per UTF-8 byte across the complete outbound request.
    // This deliberately over-reserves common text, Chinese, and tool schemas.
    const estimatedInputTokens = Buffer.byteLength(JSON.stringify(requestBody), 'utf8')
    const reserveTokens = estimatedInputTokens + maxOutputTokens + thinkingTokensReserved

    const usage = await checkUsage(userId, reserveTokens, keyRecord.credits)

    if (usage.allowedTokens === 0) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          detail: 'Monthly quota exhausted. Upgrade your plan or purchase credits.',
          used: usage.usedTokens,
          quota: isFinite(usage.quotaTokens) ? usage.quotaTokens : 'Unlimited',
          overageCost: usage.overageCost.toFixed(4),
        },
        { status: 402 }
      )
    }

    const overageTokens = Math.max(0, usage.usedTokens + reserveTokens - usage.quotaTokens)
    const overageCost = (overageTokens / 1000) * usage.overageRate
    const totalReserve = reserveTokens + Math.round(overageCost * 1000)

    if (totalReserve > 0) {
      const deductResult: any = await execute(
        `UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1`,
        [totalReserve, userId]
      )
      if (deductResult === 0) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }
      creditsReserved = totalReserve
      reservationMade = true
    }

    // ── Call upstream; full refund on failure ──
    let response: any
    try {
      response = await proxyRequest(siliconModel, requestBody)
    } catch (upstreamErr) {
      console.error('[proxy upstream error]', upstreamErr)
      if (reservationMade && creditsReserved > 0) {
        await execute(
          `UPDATE users SET credits = credits + $1 WHERE id = $2`,
          [creditsReserved, userId]
        )
        reservationMade = false
      }
      return NextResponse.json({ error: 'Model provider unavailable' }, { status: 502 })
    }

    // ── Reconciliation ──
    let actualTokens = reserveTokens
    try {
      const u = response?.usage
      if (u) actualTokens = (u.prompt_tokens || 0) + (u.completion_tokens || 0)
    } catch {}

    if (actualTokens <= 0) actualTokens = reserveTokens

    const actualOverage = Math.max(0, usage.usedTokens + actualTokens - usage.quotaTokens)
    const actualOverageCost = (actualOverage / 1000) * usage.overageRate
    const actualTotalCharge = actualTokens + Math.round(actualOverageCost * 1000)

    const diff = creditsReserved - actualTotalCharge

    const maskedResponse = {
      id: 'chatcmpl-' + crypto.randomBytes(12).toString('hex'),
      object: response?.object || 'chat.completion',
      created: response?.created || Math.floor(Date.now() / 1000),
      model: modelId,
      choices: (response?.choices || []).map((choice: any) => ({
        index: choice?.index ?? 0,
        message: {
          role: 'assistant',
          content: styleModelFilter(modelId, choice?.message?.content || choice?.delta?.content || ''),
        },
        finish_reason: choice?.finish_reason || 'stop',
      })),
      usage: {
        prompt_tokens: response?.usage?.prompt_tokens || 0,
        completion_tokens: response?.usage?.completion_tokens || 0,
        total_tokens: (response?.usage?.prompt_tokens || 0) + (response?.usage?.completion_tokens || 0),
      },
    }

    const proxiedRes = NextResponse.json(maskedResponse)
    for (const [key, value] of Object.entries(rateLimitHeaders(rateCheck))) {
      proxiedRes.headers.set(key, value)
    }

    // Final balance adjustment, usage records, and key timestamp commit together.
    // If the transaction fails, it rolls back entirely and the outer catch refunds
    // the untouched reservation.
    const settlement = await prisma.$transaction(async (tx) => {
      let shortfall = false
      let extraCharge = 0

      if (diff > 0) {
        await tx.$executeRawUnsafe(
          'UPDATE users SET credits = credits + $1 WHERE id = $2',
          diff,
          userId
        )
      } else if (diff < 0) {
        extraCharge = -diff
        const adjusted = await tx.$executeRawUnsafe(
          'UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1',
          extraCharge,
          userId
        )
        shortfall = adjusted === 0
      }

      await recordUsageInTransaction(
        tx,
        userId,
        actualTokens,
        actualOverageCost,
        actualOverage,
        modelId,
        shortfall
      )
      await tx.$executeRawUnsafe(
        'UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1',
        hashedKey
      )

      return { shortfall, extraCharge }
    })

    reservationMade = false

    if (settlement.shortfall) {
      console.error(
        `[proxy] Overage charge failed: need ${settlement.extraCharge}, user ${userId}, model ${modelId}`
      )
      return NextResponse.json(
        { error: 'Usage exceeded reservation. Please retry with sufficient credits.' },
        { status: 402 }
      )
    }

    return proxiedRes
  } catch (err) {
    console.error('[proxy error]', err)
    // A failed settlement transaction leaves the original reservation untouched.
    if (reservationMade && creditsReserved > 0 && userId) {
      try {
        await execute(
          `UPDATE users SET credits = credits + $1 WHERE id = $2`,
          [creditsReserved, userId]
        )
      } catch {}
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
