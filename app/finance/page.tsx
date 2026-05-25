import { TrendingUp, Landmark, PiggyBank, Bitcoin } from 'lucide-react'

const AGENTS = [
  {
    id: 'market-intel',
    label: 'Market Intelligence',
    icon: TrendingUp,
    desc: 'Scans equities, macro signals, and indices. Generates daily briefings and sector alerts.',
    model: 'qwen3:14b',
  },
  {
    id: 'portfolio',
    label: 'Portfolio Strategist',
    icon: Landmark,
    desc: 'Analyzes allocation, rebalancing signals, and risk exposure across asset classes.',
    model: 'qwen3:14b',
  },
  {
    id: 'savings',
    label: 'Savings Optimizer',
    icon: PiggyBank,
    desc: 'Tracks monthly expenses, identifies savings opportunities, and models FL move scenarios.',
    model: 'qwen3:14b',
  },
  {
    id: 'crypto',
    label: 'Crypto & Alt Assets',
    icon: Bitcoin,
    desc: 'On-chain data analysis, DeFi yield tracking, cross-asset correlation signals.',
    model: 'qwen3:14b',
  },
]

export default function FinancePage() {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* Banner */}
      <div
        className="rounded-lg border animate-fade-up"
        style={{ background: 'var(--vsurface)', borderColor: 'var(--vborder)', borderTop: '3px solid #059669' }}
      >
        <div className="px-6 py-5">
          <div
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 400,
              fontSize: 10,
              color: '#059669',
              letterSpacing: '0.2em',
              marginBottom: 8,
            }}
          >
            FINANCE AGENT SUITE
          </div>
          <div
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: 'var(--vtext)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            Local Intelligence Stack
          </div>
          <div
            className="mt-2"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 13, color: 'var(--vmuted)' }}
          >
            4 specialized agents &middot; Mac Studio M4 Max &middot; qwen3:14b via Ollama
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-2 gap-4">
        {AGENTS.map(({ id, label, icon: Icon, desc, model }, i) => (
          <div
            key={id}
            className="card-hover rounded-lg border animate-fade-up"
            style={{
              background: 'var(--vsurface)',
              borderColor: 'var(--vborder)',
              borderTop: '3px solid #059669',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(5,150,105,0.12)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#059669' }} />
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: 'var(--vtext)' }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 10, color: 'var(--vmuted)', marginTop: 2 }}>
                    mac_studio &middot; {model}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 400, fontSize: 12, color: 'var(--vmuted)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
