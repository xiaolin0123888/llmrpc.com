import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'
import {
  MODEL_MAPPING,
  PLAN_ACCESS,
  styleModelFilter,
  checkAntiSpider,
  estimateTokens,
} from '@/lib/models-config'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate_limit'

const PLAN_QUOTA: Record<string, number> = {
  Free: 100000,
  Basic: 500000,
  Pro: 2000000,
  Enterprise: 6000000,
  Unlimited: 9999999999,
}

const OVERAGE_RATE: Record<string, number> = {
  Free: 0.002,
  Basic: 0.0012,
  Pro: 0.0009,
  Enterprise: 0.0006,
  Unlimited: 0,
}

function buildOpenAIResponse(response: any, showModel: string): any {
  const time = Math.floor(Date.now() / 1000)
  const newId = response?.id ?? 'chatcmpl-' + crypto.randomBytes(12).toString('hex')
  return {
    id: newId,
    object: 'chat.completion',
    created: response?.created ?? time,
    model: showModel,
    system_fingerprint: response?.system_fingerprint ?? null,
    choices: (response?.choices ?? []).map((c: any) => ({
      index: c?.index ?? 0,
      message: {
        role: c?.message?.role ?? 'assistant',
        content: styleModelFilter(showModel, c?.message?.content ?? ''),
      },
      logprobs: c?.logprobs ?? null,
      finish_reason: c?.finish_reason ?? 'stop',
    })),
    usage: response?.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') ?? ''
    if (checkAntiSpider(ua)) {
      return NextResponse.json(
        { error: { message: 'Access Denied', type: 'invalid_request', code: 403 } },
        { status: 403 }
      )
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing API key', type: 'invalid_request', code: 401 } },
        { status: 401 }
      )
    }
    const apiKey = authHeader.slice(7)
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

    const keyRecord = await getOne(
      `SELECT a.user_id, u.is_banned, u.credits, u.monthly_used
       FROM api_keys a JOIN users u ON u.id = a.user_id WHERE a.key_hash = $1`,
      [keyHash]
    )
    if (!keyRecord) return NextResponse.json(
      { error: { message: 'Invalid API key', type: 'authentication_error', code: 401 } },
      { status: 401 }
    )
    if (keyRecord.is_banned) return NextResponse.json(
      { error: { message: 'Account suspended', type: 'authentication_error', code: 403 } },
      { status: 403 }
    )

    const sub = await getOne(
      'SELECT plan FROM subscriptions WHERE user_id = $1 AND status = $2 LIMIT 1',
      [keyRecord.user_id, 'ACTIVE']
    )
    const planName = sub?.plan ?? 'Free'

    // Rate limit check
    const rl = checkRateLimit(keyHash, planName)
    if (!rl.allowed) {
      const headers = rateLimitHeaders(rl)
      return NextResponse.json(
        { error: { message: 'Rate limit exceeded. Please slow down.', code: 429 } },
        { status: 429, headers }
      )
    }

    const resetDay = new Date().getUTCDate()
    let monthlyUsed = keyRecord.monthly_used ?? 0
    if (resetDay === 1) {
      monthlyUsed = 0
      await execute('UPDATE users SET monthly_used = 0, quota_reset_at = NOW() WHERE id = $1', [keyRecord.user_id])
    }

    const body = await req.json()
    const showModel = body.model
    if (!showModel) return NextResponse.json(
      { error: { message: 'model is required', type: 'invalid_request', code: 400 } },
      { status: 400 }
    )

    const allowedModels = PLAN_ACCESS[planName] ?? PLAN_ACCESS['Free']
    if (!allowedModels.includes(showModel)) {
      return NextResponse.json(
        { error: { message: 'Your ' + planName + ' plan cannot access model: ' + showModel, type: 'invalid_request', code: 403 } },
        { status: 403 }
      )
    }

    const realModel = MODEL_MAPPING[showModel]
    if (!realModel) return NextResponse.json(
      { error: { message: 'Model not supported', type: 'invalid_request', code: 400 } },
      { status: 400 }
    )

    const inputText = JSON.stringify(body.messages ?? [])
    const promptTokens = estimateTokens(inputText)

    const quota = PLAN_QUOTA[planName] ?? 0
    const balance = keyRecord.credits ?? 0
    const remaining = quota - monthlyUsed
    const overageRate = OVERAGE_RATE[planName] ?? 0

    if (remaining <= 0 && balance <= 0) {
      return NextResponse.json(
        { error: { message: 'Monthly quota exhausted. Please upgrade your plan.', type: 'invalid_request', code: 402 } },
        { status: 402 }
      )
    }

    const { siliconflow } = await import('@/lib/models')
    const upstreamPayload = { ...body, model: realModel }
    delete upstreamPayload.stream

    let response: any
    try {
      const res = await siliconflow.post('/chat/completions', upstreamPayload)
      response = res.data
    } catch (err: any) {
      console.error('[SiliconFlow error]', err?.response?.data ?? err.message)
      return NextResponse.json(
        { error: { message: err?.response?.data?.error?.message ?? 'Upstream error', type: 'upstream_error', code: 502 } },
        { status: 502 }
      )
    }

    const usage = response?.usage
    const promptTokensReal = usage?.prompt_tokens ?? promptTokens
    const completionTokens = usage?.completion_tokens ?? 0
    const totalTokens = promptTokensReal + completionTokens

    await execute('UPDATE users SET monthly_used = monthly_used + $1, quota_reset_at = NOW() WHERE id = $2', [totalTokens, keyRecord.user_id])

    if (totalTokens > remaining && balance > 0) {
      const overageTokens = totalTokens - Math.max(0, remaining)
      const overageCost = (overageTokens / 1000) * overageRate
      if (overageCost > 0 && balance >= overageCost) {
        await execute('UPDATE users SET credits = credits - $1 WHERE id = $2', [overageCost, keyRecord.user_id])
        await execute(
          "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'OVERAGE', $2, $3)",
          [keyRecord.user_id, -overageCost, 'Overage tokens']
        )
      }
    }

    const creditsCost = Math.max(1, Math.ceil(totalTokens / 4))
    if (balance > creditsCost) {
      await execute('UPDATE users SET credits = credits - $1 WHERE id = $2', [creditsCost, keyRecord.user_id])
      await execute(
        "INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'API_USAGE', $2, $3)",
        [keyRecord.user_id, -creditsCost, 'API call: ' + showModel]
      )
    }

    const finalResponse = buildOpenAIResponse(response, showModel)
    await execute('UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1', [keyHash])

    const rlHeaders = rateLimitHeaders(checkRateLimit(keyHash, planName))
    return NextResponse.json(finalResponse, { headers: rlHeaders })
  } catch (err) {
    console.error('[proxy error]', err)
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'internal_error', code: 500 } },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { object: 'list', data: [], model: 'gpt-4o', total_params: 0, completion_tokens: 0 },
    { status: 200 }
  )
}