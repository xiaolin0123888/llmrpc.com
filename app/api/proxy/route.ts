import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, recordUsage, getUserPlanName } from '@/lib/usage'
import { MODEL_MAPPING, PLAN_ACCESS, styleModelFilter, injectPersona } from '@/lib/models-config'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate_limit'
import crypto from 'crypto'

const MAX_TOKENS_CAP = 16384
const MAX_MESSAGES = 100

function normalizePlanName(raw: string): string {
  const map: Record<string, string> = {
    free: 'Free', basic: 'Basic', pro: 'Pro',
    enterprise: 'Enterprise', unlimited: 'Unlimited',
  }
  return map[raw.toLowerCase()] || 'Free'
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

    // ── Message count limit ──
    if (Array.isArray(body.messages) && body.messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_MESSAGES} messages per request` },
        { status: 400 }
      )
    }

    if (typeof body.n === 'number' && body.n !== 1) {
      return NextResponse.json(
        { error: 'n>1 is not supported. Make separate requests for multiple completions.' },
        { status: 400 }
      )
    }

    const maxOutputTokens = Math.min(
      typeof body.max_tokens === 'number' && body.max_tokens > 0 ? body.max_tokens : MAX_TOKENS_CAP,
      MAX_TOKENS_CAP
    )
    if (body.max_tokens && body.max_tokens > MAX_TOKENS_CAP) {
      body.max_tokens = MAX_TOKENS_CAP
    }

    if (body.stream) body.stream = false

    const siliconModel = MODEL_MAPPING[modelId]
    const messages = injectPersona(modelId, body.messages || [])

    // ── Estimate input from full request body (messages + tools + everything) ──
    // Per SiliconFlow: Chinese ≈ 0.5–1 token/char.  ceil(len/2) gives ≤0.5 token/char.
    // With 30% buffer this safely covers most Chinese + tool definitions.
    const requestSize = JSON.stringify({
      model: siliconModel,
      messages,
      tools: body.tools,
      tool_choice: body.tool_choice,
      temperature: body.temperature,
      top_p: body.top_p,
      frequency_penalty: body.frequency_penalty,
      presence_penalty: body.presence_penalty,
      stop: body.stop,
    }).length
    const estimatedInputTokens = Math.ceil(requestSize / 2)
    const inputBuffer = Math.ceil(estimatedInputTokens * 0.3)
    const reserveTokens = estimatedInputTokens + inputBuffer + maxOutputTokens

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
      const requestBody = { ...body, messages }
      response = await proxyRequest(siliconModel, requestBody)
    } catch (upstreamErr) {
      console.error('[proxy upstream error]', upstreamErr)
      if (reservationMade && creditsReserved > 0) {
        await execute(
          `UPDATE users SET credits = credits + $1 WHERE id = $2`,
          [creditsReserved, userId]
        )
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
    if (diff > 0) {
      await execute(
        `UPDATE users SET credits = credits + $1 WHERE id = $2`,
        [diff, userId]
      )
    } else if (diff < 0) {
      const extraCharge = -diff
      const extraResult: any = await execute(
        `UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1`,
        [extraCharge, userId]
      )
      if (extraResult === 0) {
        console.error(
          `[proxy] Overage charge failed: need ${extraCharge}, user ${userId}, model ${modelId}`
        )
        return NextResponse.json(
          { error: 'Usage exceeded reservation. Please retry with sufficient credits.' },
          { status: 402 }
        )
      }
    }

    // ── Record usage BEFORE clearing reservation flag ──
    // If this fails, reservationMade stays true → outer catch refunds.
    await recordUsage(userId, actualTokens, actualOverageCost, actualOverage, modelId, 'API call: ' + modelId)
    await execute('UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1', [hashedKey])

    reservationMade = false

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
    return proxiedRes
  } catch (err) {
    console.error('[proxy error]', err)
    // Only refund if we haven't reconciled + recorded
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
