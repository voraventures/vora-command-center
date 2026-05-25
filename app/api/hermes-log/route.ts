import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.VORA_WEBHOOK_SECRET}`) {
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
