import { useEffect, useRef } from 'react'

interface StreakBadgeProps { count: number; size?: 'sm' | 'lg' }

export default function StreakBadge({ count, size = 'sm' }: StreakBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dim = size === 'lg' ? 80 : 48

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = dim; canvas.height = dim
    type P = { x:number;y:number;vx:number;vy:number;life:number;size:number;type:'blob'|'spark' }
    const particles: P[] = []

    const spawn = () => {
      const n = count === 0 ? 2 : 8
      for (let i = 0; i < n; i++) {
        const isSpark = Math.random() < 0.3
        particles.push({
          x: dim/2 + (Math.random()-0.5)*dim*0.3,
          y: dim*0.7 + Math.random()*dim*0.2,
          vx: (Math.random()-0.5)*0.8,
          vy: -(Math.random()*1.5 + 0.5),
          life: Math.random()*0.7 + 0.3,
          size: isSpark ? Math.random()*2+1 : Math.random()*6+3,
          type: isSpark ? 'spark' : 'blob',
        })
      }
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0,0,dim,dim)
      spawn()
      for (let i = particles.length-1; i>=0; i--) {
        const p = particles[i]
        p.x += p.vx + (Math.random()-0.5)*0.3
        p.y += p.vy
        p.vy -= 0.02
        p.life -= 0.018
        if (p.life <= 0) { particles.splice(i,1); continue }
        ctx.save()
        ctx.globalAlpha = p.life
        if (p.type === 'blob') {
          const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size)
          g.addColorStop(0,'rgba(255,220,50,0.9)')
          g.addColorStop(0.4,'rgba(249,115,22,0.7)')
          g.addColorStop(1,'rgba(239,68,68,0)')
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
          ctx.fillStyle = g; ctx.fill()
        } else {
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
          ctx.fillStyle='rgba(255,230,100,0.9)'; ctx.fill()
        }
        ctx.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [count, dim])

  const text = size === 'lg' ? 'text-3xl' : 'text-base'
  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{width:dim,height:dim}}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <span className={`relative z-10 font-display ${text} text-foreground leading-none`}>
        {count}
      </span>
    </div>
  )
}