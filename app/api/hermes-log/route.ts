import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const secret = process.env.VORA_WEBHOOK_SECRET
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action, detail, product } = body

  if (!action) {
    return NextResponse.json({ error: 'Missing action field' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from('hermes_log').insert({
    action,
    detail: detail ?? null,
    product: product ?? null,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
