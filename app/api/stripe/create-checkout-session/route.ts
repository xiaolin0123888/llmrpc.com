import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { execute, getOne } from '@/lib/db'
import { safeJson } from '@/lib/safe-json'
import Stripe from 'stripe'

// Map plan name to Stripe Price ID (set via env)
const PLAN_PRICE_IDS: Record<string, string> = {
  Basic:      process.env.STRIPE_PRICE_BASIC      || '',
  Pro:        process.env.STRIPE_PRICE_PRO        || '',
  Enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
  Unlimited:  process.env.STRIPE_PRICE_UNLIMITED  || '',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [body, parseError] = await safeJson<{ plan?: string }>(req)
    if (parseError) return parseError

    const plan = body?.plan
    const priceId = plan ? PLAN_PRICE_IDS[plan] : ''

    if (!plan || !priceId) {
      return NextResponse.json({ error: 'Invalid plan or Stripe price not configured' }, { status: 400 })
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://llmrpc.com'

    // Get or create Stripe customer
    const user = await getOne('SELECT * FROM users WHERE id = $1', [session.user.userId])
    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId: session.user.userId },
      })
      customerId = customer.id
      await execute('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, session.user.userId])
    }

    // Create Stripe Checkout Session (subscription mode)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing?stripe=success&plan=${plan}`,
      cancel_url: `${baseUrl}/billing?stripe=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        userId: session.user.userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: session.user.userId,
          plan,
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('[stripe create-checkout]', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
