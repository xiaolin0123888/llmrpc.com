import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://llmrpc.com'

    const user = await getOne('SELECT stripe_customer_id FROM users WHERE id = $1', [session.user.userId])

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${baseUrl}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('[stripe portal]', err)
    return NextResponse.json({ error: "Portal error" }, { status: 500 })
  }
}