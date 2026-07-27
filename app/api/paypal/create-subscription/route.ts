import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Map plan names to PayPal Plan IDs (configured via env vars)
function getPayPalPlanId(planName: string): string | undefined {
  const key = `PAYPAL_PLAN_${planName.toUpperCase()}`
  return process.env[key]
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { plan } = await req.json()
    const planName = String(plan || '').trim().toUpperCase()

    const validPlans = ['BASIC', 'PRO', 'ENTERPRISE', 'UNLIMITED']
    if (!validPlans.includes(planName)) {
      return NextResponse.json({ error: `Invalid plan: ${plan}. Valid: ${validPlans.join(', ')}` }, { status: 400 })
    }

    const planId = getPayPalPlanId(planName)

    if (!planId) {
      return NextResponse.json({
        error: 'PayPal subscription not configured for this plan',
        detail: `Missing PAYPAL_PLAN_${planName} environment variable.`,
      }, { status: 501 })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || 'sandbox'

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://llmrpc.com'
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const endpoint = mode === 'live'
      ? 'https://api-m.paypal.com/v1/billing/subscriptions'
      : 'https://api-m.sandbox.paypal.com/v1/billing/subscriptions'

    const payload = {
      plan_id: planId,
      application_context: {
        brand_name: 'LLMCluster',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${baseUrl}/billing?paypal_sub=success`,
        cancel_url: `${baseUrl}/billing?paypal_sub=cancelled`,
      },
      custom_id: JSON.stringify({
        userId: session.user.id,
        plan: planName,
      }),
    }

    const ppRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    })

    if (!ppRes.ok) {
      const errText = await ppRes.text().catch(() => '')
      console.error('[paypal create-subscription error]', ppRes.status, errText.slice(0, 500))
      return NextResponse.json(
        { error: 'PayPal subscription creation failed' },
        { status: 502 }
      )
    }

    const subscription = await ppRes.json()

    // Store pending subscription in DB
    // Check if user already has a subscription for this plan
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        plan: planName as any,
      },
    })

    const now = new Date()
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: 'PENDING',
          paypalSubscriptionId: subscription.id,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          metadata: {
            paypalPlanId: planId,
            updatedAt: now.toISOString(),
          },
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: planName as any,
          status: 'PENDING',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          paypalSubscriptionId: subscription.id,
          metadata: {
            paypalPlanId: planId,
            createdAt: now.toISOString(),
          },
        },
      })
    }

    const approveUrl = subscription.links?.find((l: any) => l.rel === 'approve')?.href

    return NextResponse.json({
      subscriptionId: subscription.id,
      approveUrl: approveUrl || null,
    })
  } catch (err) {
    console.error('[paypal create-subscription]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
