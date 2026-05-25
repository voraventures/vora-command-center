import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.VORA_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { product, mrr_usd, subscriber_count } = body

  if (!product || mrr_usd === undefined || subscriber_count === undefined) {
    return NextResponse.json({ error: 'Missing fields: product, mrr_usd, subscriber_count' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from('mrr_snapshots').insert({
    product,
    mrr_usd,
    subscriber_count,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = createServerClient()

  const { data: snapshots, error } = await supabase
    .from('mrr_snapshots')
    .select('*')
    .order('recorded_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const products = ['sparkcheck', 'twitter_growth_optimizer']
  const latest: Record<string, unknown> = {}
  for (const p of products) {
    latest[p] = (snapshots ?? []).find((s) => s.product === p) ?? null
  }

  return NextResponse.json({ latest })
}
