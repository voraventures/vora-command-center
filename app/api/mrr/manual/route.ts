import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const secret = process.env.VORA_WEBHOOK_SECRET
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!secret || token !== secret) {
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
    recorded_at: new Date().toISOString(),
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
