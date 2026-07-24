import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, recordUsage, getUserPlanName } from '@/lib/usage'
import { MODEL_MAPPING, styleModelFilter, injectPersona } from '@/lib/models-config'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate_limit'
import crypto from 'crypto'

const MAX_TOKENS_CAP = 16384

export async function POST(req: NextRequest) {
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

    // ── Banned user check ──
    if (keyRecord.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // ── Rate limit ──
    const planName = await getUserPlanName(keyRecord.user_id)
    const rateCheck = checkRateLimit(hashedKey, planName)
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

    // ── Model whitelist ──
    if (!MODEL_MAPPING[modelId]) {
      return NextResponse.json({ error: `Unknown model: ${modelId}` }, { status: 400 })
    }

    const siliconModel = MODEL_MAPPING[modelId]

    // ── Cap max_tokens ──
    if (body.max_tokens && (typeof body.max_tokens !== 'number' || body.max_tokens > MAX_TOKENS_CAP)) {
      body.max_tokens = MAX_TOKENS_CAP
    }

    // ── Enforce stream=false (billing is pre-call; streaming breaks that) ──
    if (body.stream) {
      body.stream = false
    }

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

    // ── Pre-call credit check: compute total charge and verify balance ──
    const overageTokens = Math.max(0, usage.usedTokens + estimatedTokens - usage.quotaTokens)
    const overageCost = (overageTokens / 1000) * usage.overageRate
    const totalCharge = estimatedTokens + Math.round(overageCost * 1000)

    if (totalCharge > 0) {
      const deductResult: any = await execute(
        `UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1`,
        [totalCharge, keyRecord.user_id]
      )
      if (deductResult === 0) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }
    }

    // ── Send to SiliconFlow (credits already reserved) ──
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

    // ── Reconcile: refund if actual < estimated, charge extra if actual > estimated ──
    const actualOverage = Math.max(0, usage.usedTokens + actualTokens - usage.quotaTokens)
    const actualOverageCost = (actualOverage / 1000) * usage.overageRate
    const actualTotalCharge = actualTokens + Math.round(actualOverageCost * 1000)

    const diff = actualTotalCharge - totalCharge
    if (diff > 0) {
      // Actual exceeded estimate — charge the difference
      await execute(
        `UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1`,
        [diff, keyRecord.user_id]
      )
    } else if (diff < 0) {
      // Estimate was too high — refund the difference
      await execute(
        `UPDATE users SET credits = credits + $1 WHERE id = $2`,
        [-diff, keyRecord.user_id]
      )
    }

    await recordUsage(
      keyRecord.user_id,
      actualTokens,
      actualOverageCost,
      actualOverage,
      modelId,
      'API call: ' + modelId
    )

    await execute('UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1', [hashedKey])

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

    const proxiedRes = NextResponse.json(maskedResponse)
    // Add rate-limit headers
    for (const [key, value] of Object.entries(rateLimitHeaders(rateCheck))) {
      proxiedRes.headers.set(key, value)
    }
    return proxiedRes
  } catch (err) {
    console.error('[proxy error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
