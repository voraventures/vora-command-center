'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
}

export function CountUp({ target, prefix = '', suffix = '', duration = 1100, decimals = 0 }: Props) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = eased * target
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, decimals])

  return (
    <span>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}
      {suffix}
    </span>
  )
}
