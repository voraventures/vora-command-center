import { ExternalLink, Github, Circle } from 'lucide-react'
import { Product } from '@/lib/types'

const ACCENT: Record<string, string> = {
  sparkcheck: '#FF5C8D',
  twitter_growth_optimizer: '#1DA1F2',
}

export function ProductCard({ product }: { product: Product }) {
  const accent = ACCENT[product.id] ?? '#9B5CFF'

  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F] rounded p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className="font-mono text-xs font-bold tracking-wider uppercase mb-1"
            style={{ color: accent }}
          >
            {product.label}
          </div>
          <div className="flex items-center gap-2">
            <Circle
              className="w-2 h-2 fill-current"
              style={{
                color:
                  product.status === 'live'
                    ? '#22c55e'
                    : product.status === 'building'
                    ? '#f59e0b'
                    : '#6b7280',
              }}
            />
            <span className="font-mono text-[11px] text-zinc-400 uppercase">
              {product.status}
            </span>
          </div>
        </div>
      </div>

      {product.notes && (
        <p className="text-zinc-500 text-xs font-sans mb-3">{product.notes}</p>
      )}

      <div className="flex items-center gap-3 mt-4">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Live
        </a>
        <a
          href={`https://github.com/${product.github_repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <Github className="w-3 h-3" />
          Repo
        </a>
      </div>

      {product.last_deploy && (
        <div className="mt-3 pt-3 border-t border-[#1E1E1E]">
          <span className="font-mono text-[10px] text-zinc-600">
            LAST DEPLOY{' '}
            {new Date(product.last_deploy).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
