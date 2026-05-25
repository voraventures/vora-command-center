import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const secret = process.env.VORA_WEBHOOK_SECRET
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    agent_id, agent_label, machine, model,
    input_summary, output_summary, duration_ms, status,
    input_tokens, output_tokens, estimated_cost_usd,
  } = body

  if (!agent_id || !agent_label || !machine || !model) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from('agent_runs').insert({
    agent_id,
    agent_label,
    machine,
    model,
    input_summary: input_summary ?? null,
    output_summary: output_summary ?? null,
    duration_ms: duration_ms ?? null,
    status: status ?? 'success',
    input_tokens: input_tokens ?? 0,
    output_tokens: output_tokens ?? 0,
    estimated_cost_usd: estimated_cost_usd ?? 0,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
