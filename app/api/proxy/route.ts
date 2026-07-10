import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, recordUsage } from '@/lib/usage'
import { MODEL_MAPPING, PLAN_ACCESS, normalizePlanName, styleModelFilter, injectPersona } from '@/lib/models-config'
import { extractApiKey, unauthorizedResponse, verifyApiKey } from '@/lib/api-auth'
import { safeJson } from '@/lib/safe-json'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate_limit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req)
    if (!apiKey) return unauthorizedResponse()

    if (process.env.LLM_PROXY_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'API proxy is temporarily unavailable while usage accounting is being hardened.' },
        { status: 503, headers: { 'Retry-After': '86400' } }
      )
    }

    const keyRecord = await verifyApiKey(apiKey)
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const planName = normalizePlanName(keyRecord.plan)
    const rateLimit = checkRateLimit(keyRecord.key_hash, planName)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      )
    }

    const [body, parseError] = await safeJson<Record<string, any>>(req)
    if (parseError) return parseError
    if (!body) {
      return NextResponse.json({ error: 'Request body required' }, { status: 400 })
    }

    if (body.stream === true) {
      return NextResponse.json(
        {
          error: {
            message: 'Streaming responses are not supported yet. Set stream to false.',
            type: 'invalid_request_error',
          },
        },
        { status: 400 }
      )
    }

    const modelId = body.model
    if (typeof modelId !== 'string' || !modelId) {
      return NextResponse.json({ error: 'model field required' }, { status: 400 })
    }

    // Map external model name -> real SiliconFlow model
    const siliconModel = MODEL_MAPPING[modelId]
    if (!siliconModel) {
      return NextResponse.json({ error: 'Unsupported model' }, { status: 400 })
    }
    if (!PLAN_ACCESS[planName].includes(modelId)) {
      return NextResponse.json({ error: 'This model is not available on your plan' }, { status: 403 })
    }

    // Inject role-playing persona to impersonate the target model
    const messages = injectPersona(modelId, body.messages || [])

    const estimatedTokens = Math.ceil(
      (JSON.stringify(messages).length / 4) * 1.5
    )

    const usage = await checkUsage(
      keyRecord.user_id,
      estimatedTokens,
      keyRecord.credits
    )

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

    // Send to SiliconFlow with persona-injected messages
    const requestBody = { ...body, messages }
    const response = await proxyRequest(siliconModel, requestBody)

    let actualTokens = estimatedTokens
    try {
      const u = response?.usage
      if (u) {
        actualTokens = (u.prompt_tokens || 0) + (u.completion_tokens || 0)
      }
    } catch {}

    if (actualTokens <= 0) actualTokens = estimatedTokens

    const overageTokens = Math.max(0, usage.usedTokens + actualTokens - usage.quotaTokens)
    const overageCost = (overageTokens / 1000) * usage.overageRate
    const totalCharge = actualTokens + Math.round(overageCost * 1000)

    if (totalCharge > 0) {
      await execute('UPDATE users SET credits = credits - $1 WHERE id = $2', [totalCharge, keyRecord.user_id])
    }

    await recordUsage(
      keyRecord.user_id,
      actualTokens,
      overageCost,
      overageTokens,
      modelId,
      'API call: ' + modelId
    )

    await execute('UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1', [keyRecord.key_hash])

    // Mask the response to hide SiliconFlow
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

    return NextResponse.json(maskedResponse)
  } catch (err) {
    console.error('[proxy error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
