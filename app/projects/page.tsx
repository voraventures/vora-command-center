import { createServerClient } from '@/lib/supabase'
import { OverviewRevenueChart } from '@/components/overview-revenue-chart'
import { GitBranch, ExternalLink } from 'lucide-react'

export const revalidate = 30

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="flex items-center justify-between" style={{ paddingBottom: 14 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: '#9C6FFF', letterSpacing: '0.15em' }}>{n}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--vtext)', margin: 0, lineHeight: 1 }}>{title}</h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)' }}>{subtitle}</span>
      </div>
      <div style={{ borderBottom: '1px solid var(--vborder)' }} />
    </div>
  )
}

export default async function ProjectsPage() {
  const supabase = createServerClient()

  const [{ data: snapshots }] = await Promise.all([
    supabase.from('mrr_snapshots').select('*').order('recorded_at', { ascending: true }),
  ])

  const sparkLatest = (snapshots ?? []).filter(s => s.product === 'sparkcheck').slice(-1)[0]
  const twitterLatest = (snapshots ?? []).filter(s => s.product === 'twitter_growth_optimizer').slice(-1)[0]

  const PROJECTS = [
    {
      id: 'sparkcheck',
      name: 'SparkCheck',
      description: 'Anti-swipe video-first dating app for intentional connections. No endless swiping — deep compatibility matching.',
      status: 'ACTIVE',
      color: '#FF4D8D',
      github: 'github.com/vora/sparkcheck',
      url: 'sparkcheck.app',
      mrr: sparkLatest?.mrr_usd ?? 0,
      subs: sparkLatest?.subscriber_count ?? 0,
    },
    {
      id: 'twitter_growth_optimizer',
      name: 'Twitter Growth Optimizer',
      description: 'AI-powered Twitter growth system. Optimizes posting schedule, content, and engagement for FL subscriber trigger.',
      status: 'ACTIVE',
      color: '#1D9BF0',
      github: 'github.com/vora/twitter-growth',
      url: 'twittergrowth.vora.app',
      mrr: twitterLatest?.mrr_usd ?? 0,
      subs: twitterLatest?.subscriber_count ?? 0,
    },
    {
      id: 'aguacate',
      name: 'Aguacate AI',
      description: 'AI-powered nutrition and meal planning platform. Personalized diet optimization with real-time tracking.',
      status: 'IN DEVELOPMENT',
      color: '#9C6FFF',
      github: 'github.com/vora/aguacate',
      url: null as string | null,
      mrr: null as number | null,
      subs: null as number | null,
    },
  ]

  return (
    <div className="space-y-10 max-w-6xl">

      {/* SECTION 01 — ACTIVE PROJECTS */}
      <section className="space-y-4">
        <SectionHeader n="01" title="Active Projects" subtitle="3 products · Vora Ventures" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROJECTS.map((project) => {
            const isAguacate = project.id === 'aguacate'
            return (
              <div
                key={project.id}
                style={{
                  background: 'var(--vsurface)',
                  border: '1px solid var(--vborder)',
                  borderTop: `3px solid ${project.color}`,
                  borderRadius: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isAguacate && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(156,111,255,0.15)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 9,
                    color: '#9C6FFF',
                    padding: '4px 0',
                    letterSpacing: '0.2em',
                  }}>
                    IN DEVELOPMENT
                  </div>
                )}
                <div style={{ padding: '20px', paddingTop: isAguacate ? 28 : 20 }}>
                  {/* Header */}
                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: project.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--vtext)' }}>
                      {project.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 400,
                      fontSize: 9,
                      background: `${project.color}18`,
                      color: project.color,
                      letterSpacing: '0.1em',
                    }}>
                      {project.status}
                    </span>
                  </div>

                  {/* Description */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 11, color: 'var(--vmuted)', lineHeight: 1.6, marginTop: 8 }}>
                    {project.description}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5" style={{ marginTop: 16, opacity: isAguacate ? 0.5 : 1 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: isAguacate ? 'var(--vmuted)' : project.color }}>
                        {isAguacate ? '—' : `$${(project.mrr ?? 0).toLocaleString()} MRR`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)' }}>
                        {isAguacate ? '—' : `${(project.subs ?? 0)} subscribers`}
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-col gap-1.5" style={{ marginTop: 16 }}>
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
                        {project.github}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!isAguacate && <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--vmuted)' }} />}
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)' }}>
                        {project.url ?? 'Coming soon'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 02 — PROJECT METRICS */}
      <section className="space-y-4">
        <SectionHeader n="02" title="Project Metrics" subtitle="Revenue history · all products" />
        <OverviewRevenueChart snapshots={snapshots ?? []} />
      </section>
    </div>
  )
}
