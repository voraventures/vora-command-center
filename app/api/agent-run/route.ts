import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.VORA_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { agent_id, agent_label, machine, model, input_summary, output_summary, duration_ms, status } = body

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
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
