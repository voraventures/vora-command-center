export interface MrrSnapshot {
  id: string
  product: string
  mrr_usd: number
  subscriber_count: number
  recorded_at: string
}

export interface AgentRun {
  id: string
  agent_id: string
  agent_label: string
  machine: string
  model: string
  input_summary: string | null
  output_summary: string | null
  duration_ms: number | null
  status: string
  ran_at: string
}

export interface HermesLog {
  id: string
  action: string
  detail: string | null
  product: string | null
  logged_at: string
}

export interface Product {
  id: string
  label: string
  url: string
  github_repo: string
  status: string
  last_deploy: string | null
  notes: string | null
}
