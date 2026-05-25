import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map Stripe product IDs to Vora product IDs
// Luis must set these env vars with his actual Stripe product IDs
const PRODUCT_MAP: Record<string, string> = {
  [process.env.STRIPE_PRODUCT_SPARKCHECK ?? '']: 'sparkcheck',
  [process.env.STRIPE_PRODUCT_TWITTER ?? '']: 'twitter_growth_optimizer',
}

function getProductId(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.product as string
  return PRODUCT_MAP[priceId] || 'unknown'
}

async function updateMRR(productId: string) {
  if (productId === 'unknown') return

  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
    expand: ['data.items.data.price'],
  })

  let mrr = 0
  let count = 0

  for (const sub of subscriptions.data) {
    const pid = getProductId(sub)
    if (pid !== productId) continue
    count++
    const price = sub.items.data[0]?.price
    if (!price) continue
    const amount = price.unit_amount ?? 0
    const interval = price.recurring?.interval
    if (interval === 'month') mrr += amount / 100
    else if (interval === 'year') mrr += amount / 100 / 12
  }

  await supabase.from('mrr_snapshots').insert({
    product: productId,
    mrr_usd: mrr,
    subscriber_count: count,
    recorded_at: new Date().toISOString(),
  })

  console.log(`[STRIPE] Updated ${productId}: $${mrr} MRR, ${count} subscribers`)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[STRIPE] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[STRIPE] Event: ${event.type}`)

  const subscriptionEvents = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ]

  if (subscriptionEvents.includes(event.type)) {
    let subscription: Stripe.Subscription | null = null

    if (event.type.startsWith('customer.subscription')) {
      subscription = event.data.object as Stripe.Subscription
    } else if (event.type.startsWith('invoice')) {
      const invoice = event.data.object as Stripe.Invoice
      // The versioned type omits .subscription; it exists on the wire object
      const subId = (invoice as unknown as { subscription?: string }).subscription
      if (subId) {
        subscription = await stripe.subscriptions.retrieve(subId)
      }
    }

    if (subscription) {
      const productId = getProductId(subscription)
      await updateMRR(productId)
    }
  }

  return NextResponse.json({ received: true })
}
