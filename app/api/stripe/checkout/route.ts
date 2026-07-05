import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

  try {
    const { credits, priceId } = await req.json()

    if (credits) {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits.toLocaleString()} Credits`,
                description: 'LLMRpc AI API Credits',
              },
              unit_amount: Math.round(credits * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
        metadata: {
          userId: session.user.userId,
          credits: credits.toString(),
          type: 'CREDIT_TOPUP',
        },
      })
      return NextResponse.json({ url: checkoutSession.url })
    }

    if (priceId) {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
        metadata: {
          userId: session.user.userId,
          type: 'SUBSCRIPTION',
        },
      })
      return NextResponse.json({ url: checkoutSession.url })
    }

    return NextResponse.json({ error: 'Missing credits or priceId' }, { status: 400 })
  } catch (err: any) {
    console.error('[stripe/checkout error]', err?.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}