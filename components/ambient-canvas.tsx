'use client'

import { useEffect, useRef } from 'react'

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Orbs
    const orbs = [
      { x: width * 0.15, y: height * 0.2,  r: 280, color: '#00E676', vx: 0.3,   vy: 0.2,   opacity: 0.12 },
      { x: width * 0.8,  y: height * 0.3,  r: 320, color: '#9C6FFF', vx: -0.2,  vy: 0.3,   opacity: 0.1  },
      { x: width * 0.5,  y: height * 0.7,  r: 260, color: '#1D9BF0', vx: 0.25,  vy: -0.2,  opacity: 0.08 },
      { x: width * 0.9,  y: height * 0.8,  r: 200, color: '#FF4D8D', vx: -0.3,  vy: -0.15, opacity: 0.09 },
      { x: width * 0.1,  y: height * 0.75, r: 240, color: '#FFB800', vx: 0.2,   vy: -0.25, opacity: 0.07 },
    ]

    // Particles
    const particles: Array<{
      x: number; y: number; vx: number; vy: number
      r: number; color: string; opacity: number; connections: number[]
    }> = []
    const PARTICLE_COUNT = 60
    const colors = ['#00E676', '#9C6FFF', '#1D9BF0', '#FF4D8D', '#FFB800']

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.3,
        connections: [],
      })
    }

    // Geometric shapes
    type ShapeType = 'circle' | 'triangle' | 'square'
    const shapes: Array<{
      x: number; y: number; size: number; rotation: number; rotSpeed: number
      vx: number; vy: number; color: string; opacity: number; type: ShapeType
    }> = []
    for (let i = 0; i < 12; i++) {
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.25 + 0.1,
        type: (['circle', 'triangle', 'square'] as ShapeType[])[Math.floor(Math.random() * 3)],
      })
    }

    const hex2 = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')

    const drawOrb = (orb: typeof orbs[0]) => {
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
      gradient.addColorStop(0, orb.color + hex2(orb.opacity))
      gradient.addColorStop(1, orb.color + '00')
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    const drawParticle = (p: typeof particles[0]) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color + hex2(p.opacity)
      ctx.fill()
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = particles[i].color + hex2(opacity)
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
    }

    const drawShape = (s: typeof shapes[0]) => {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rotation)
      ctx.strokeStyle = s.color + hex2(s.opacity)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (s.type === 'circle') {
        ctx.arc(0, 0, s.size, 0, Math.PI * 2)
      } else if (s.type === 'triangle') {
        ctx.moveTo(0, -s.size)
        ctx.lineTo(s.size * 0.866, s.size * 0.5)
        ctx.lineTo(-s.size * 0.866, s.size * 0.5)
        ctx.closePath()
      } else {
        ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size)
      }
      ctx.stroke()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      orbs.forEach(orb => {
        drawOrb(orb)
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.r || orb.x > width + orb.r) orb.vx *= -1
        if (orb.y < -orb.r || orb.y > height + orb.r) orb.vy *= -1
      })

      drawConnections()

      particles.forEach(p => {
        drawParticle(p)
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      })

      shapes.forEach(s => {
        drawShape(s)
        s.x += s.vx
        s.y += s.vy
        s.rotation += s.rotSpeed
        if (s.x < -s.size || s.x > width + s.size) s.vx *= -1
        if (s.y < -s.size || s.y > height + s.size) s.vy *= -1
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
