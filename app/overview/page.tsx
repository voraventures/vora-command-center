import { createServerClient } from '@/lib/supabase'
import { ProductCard } from '@/components/product-card'
import { MrrCard } from '@/components/mrr-card'
import { AgentLog } from '@/components/agent-log'
import { HermesFeed } from '@/components/hermes-feed'

export const revalidate = 30

export default async function OverviewPage() {
  const supabase = createServerClient()

  const [{ data: products }, { data: snapshots }, { data: agentRuns }, { data: hermesLogs }] =
    await Promise.all([
      supabase.from('products').select('*').order('id'),
      supabase
        .from('mrr_snapshots')
        .select('*')
        .order('recorded_at', { ascending: true }),
      supabase
        .from('agent_runs')
        .select('*')
        .order('ran_at', { ascending: false })
        .limit(5),
      supabase
        .from('hermes_log')
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(5),
    ])

  const productIds = ['sparkcheck', 'twitter_growth_optimizer']
  const snapshotsByProduct = (product: string) =>
    (snapshots ?? []).filter((s) => s.product === product)

  const latestByProduct = productIds.map((id) => {
    const snaps = snapshotsByProduct(id)
    return snaps[snaps.length - 1]
  })

  const totalMrr = latestByProduct.reduce((sum, s) => sum + (s?.mrr_usd ?? 0), 0)
  const totalSubs = latestByProduct.reduce((sum, s) => sum + (s?.subscriber_count ?? 0), 0)
  const pctToTarget = Math.min((totalMrr / 5000) * 100, 100)

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
          Overview
        </h1>
        <p className="font-mono text-[11px] text-zinc-500 mt-1">
          Vora Ventures · Internal Dashboard
        </p>
      </div>

      {/* Row 1: Product Cards */}
      <div className="grid grid-cols-2 gap-4">
        {(products ?? []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Row 2: MRR Summary */}
      <div className="grid grid-cols-3 gap-4">
        {productIds.map((id) => (
          <MrrCard
            key={id}
            product={id}
            snapshots={snapshotsByProduct(id)}
          />
        ))}
        <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded p-4">
          <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-3">
            Total MRR
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            ${totalMrr.toLocaleString()}
          </div>
          <div className="font-mono text-[11px] text-zinc-500 mt-1">
            {totalSubs} total subs
          </div>
          <div className="mt-4">
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1.5">
              <span>TO $5K FI TRIGGER</span>
              <span>{pctToTarget.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-[#1E1E1E] rounded overflow-hidden">
              <div
                className="h-full bg-green-500 rounded"
                style={{ width: `${pctToTarget}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Agent Runs + Hermes */}
      <div className="grid grid-cols-2 gap-4">
        <AgentLog initial={agentRuns ?? []} limit={5} realtime />
        <HermesFeed initial={hermesLogs ?? []} limit={5} realtime />
      </div>
    </div>
  )
}
