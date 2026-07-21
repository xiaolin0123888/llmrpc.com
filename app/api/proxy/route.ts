import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, recordUsage } from '@/lib/usage'
import { MODEL_MAPPING, styleModelFilter, injectPersona } from '@/lib/models-config'
import crypto from 'crypto'

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
      'SELECT a.id, a.key_hash, a.user_id, u.credits FROM api_keys a JOIN users u ON u.id = a.user_id WHERE a.key_hash = $1',
      [hashedKey]
    )
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await req.json()
    const modelId = body.model
    if (!modelId) {
      return NextResponse.json({ error: 'model field required' }, { status: 400 })
    }

    // Map external model name -> real SiliconFlow model
    const siliconModel = MODEL_MAPPING[modelId] || modelId

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

    return NextResponse.json(maskedResponse)
  } catch (err) {
    console.error('[proxy error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
