import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { proxyRequest } from '@/lib/models'
import { checkUsage, recordUsage, getUserPlanName } from '@/lib/usage'
import {
  resolveModelId,
  getSiliconFlowModelId,
  canUserAccessModel,
  calculateCreditCost,
  MODEL_PRICING,
  normalizePlanName,
} from '@/lib/models-config'

// POST /api/proxy - Proxy chat completions to SiliconFlow
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    // Verify API key and get user
    const crypto = require('crypto')
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyRecord = await prisma.apiKey.findFirst({
      where: { key: hashedKey },
      include: { user: { select: { id: true, credits: true } } },
    })

    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await req.json()
    const requestedModelId = body.model

    if (!requestedModelId) {
      return NextResponse.json({ error: 'model field required' }, { status: 400 })
    }

    // Resolve aliases (old names → new OpenRouter-format names)
    const resolvedModelId = resolveModelId(requestedModelId)

    // Check plan-based model access
    const userPlan = await getUserPlanName(keyRecord.user.id)
    if (!canUserAccessModel(userPlan, resolvedModelId)) {
      return NextResponse.json(
        {
          error: 'Model not available on your plan',
          detail: `The model "${requestedModelId}" requires a higher plan tier. Current plan: ${userPlan}. Visit /billing to upgrade.`,
          model: requestedModelId,
          currentPlan: userPlan,
        },
        { status: 403 }
      )
    }

    // Map to SiliconFlow real model ID
    const siliconModel = getSiliconFlowModelId(resolvedModelId)
    if (!siliconModel) {
      return NextResponse.json(
        { error: `Unknown model: ${requestedModelId}`, model: requestedModelId },
        { status: 400 }
      )
    }

    // Estimate tokens BEFORE making the request (for quota check)
    const estimatedInputTokens = Math.ceil(
      JSON.stringify(body.messages || []).length / 4
    )
    const estimatedTokens = Math.ceil(estimatedInputTokens * 1.5)

    // Check usage quota
    const usage = await checkUsage(
      keyRecord.user.id,
      estimatedTokens,
      keyRecord.user.credits
    )

    if (usage.allowedTokens === 0) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          detail: `Monthly quota exhausted. Upgrade your plan or purchase credits to continue.`,
          used: usage.usedTokens,
          quota: isFinite(usage.quotaTokens) ? usage.quotaTokens : 'Unlimited',
          overageCost: usage.overageCost.toFixed(4),
        },
        { status: 402 }
      )
    }

    // Make request to SiliconFlow
    const response = await proxyRequest(siliconModel, body)

    // Get actual token usage from SiliconFlow response
    let actualPromptTokens = estimatedInputTokens
    let actualCompletionTokens = estimatedTokens - estimatedInputTokens
    try {
      const usageData = response.usage
      if (usageData) {
        actualPromptTokens = usageData.prompt_tokens || estimatedInputTokens
        actualCompletionTokens = usageData.completion_tokens || 0
      }
    } catch {
      // Fall back to estimate
    }

    if (actualPromptTokens <= 0) actualPromptTokens = 1
    if (actualCompletionTokens <= 0) actualCompletionTokens = 0

    // ── Model-specific credit deduction ──
    // Unlimited plan: no credit deduction
    const normalizedPlan = normalizePlanName(userPlan)
    const isUnlimited = normalizedPlan === 'Unlimited'

    let creditCost = 0
    if (!isUnlimited) {
      creditCost = calculateCreditCost(actualPromptTokens, actualCompletionTokens, resolvedModelId)

      // Check if user has enough credits
      if (keyRecord.user.credits < creditCost) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            detail: `This request costs ${creditCost} credits but you only have ${keyRecord.user.credits}. Purchase more credits or upgrade your plan.`,
            required: creditCost,
            available: keyRecord.user.credits,
          },
          { status: 402 }
        )
      }

      // Deduct credits
      await prisma.user.update({
        where: { id: keyRecord.user.id },
        data: { credits: { decrement: creditCost } },
      })
    }

    // ── Monthly quota tracking (for usage bar display) ──
    const actualTotalTokens = actualPromptTokens + actualCompletionTokens

    // Over-quota tracking (for display purposes, actual billing is per-model)
    const overageTokens = Math.max(0, usage.usedTokens + actualTotalTokens - usage.quotaTokens)
    const overageCost = isFinite(usage.quotaTokens)
      ? (overageTokens / 1000) * usage.overageRate
      : 0

    // Record the usage transaction
    await recordUsage(
      keyRecord.user.id,
      actualTotalTokens,
      creditCost,
      overageCost,
      overageTokens,
      resolvedModelId,
      `API call: ${resolvedModelId}${isUnlimited ? ' (Unlimited — no charge)' : ` (${creditCost} credits)`}`
    )

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    })

    // Return response with usage info
    const result = {
      ...response,
      llmrpc_usage: isUnlimited ? {
        plan: 'Unlimited',
        charged: 0,
        note: 'Unlimited plan — no credit deduction',
      } : {
        plan: normalizedPlan,
        prompt_tokens: actualPromptTokens,
        completion_tokens: actualCompletionTokens,
        credits_charged: creditCost,
        model_pricing: MODEL_PRICING[resolvedModelId] || null,
      },
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[Proxy error]', err)
    return NextResponse.json(
      { error: err.message || 'Request failed' },
      { status: 500 }
    )
  }
}
