import { useState } from 'react'
import LiquidButton from './LiquidButton'

interface SkillTreeNodeProps {
  status: 'completed' | 'active' | 'locked'
  title: string
  progress: [number, number]
  time?: string
  onClick: () => void
}

export default function SkillTreeNode({ status, title, progress, onClick }: SkillTreeNodeProps) {
  const [hover, setHover] = useState(false)
  const icon = status === 'completed' ? '✓' : status === 'active' ? '▶' : '🔒'
  const circleClass =
    status === 'completed' ? 'bg-accent-ember shadow-[0_0_16px_hsl(var(--accent-ember)/0.4)]' :
    status === 'active'    ? 'bg-accent-ember/15 border-2 border-accent-ember animate-pulse-glow' :
                             'bg-white/4 border-2 border-dashed border-border opacity-40'

  return (
    <div
      className="flex flex-col items-center relative cursor-pointer"
      onClick={() => status !== 'locked' && onClick()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-105 ${circleClass}`}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground mt-2 text-center max-w-[80px] leading-tight">{title}</div>
      {status === 'active' && (
        <div className="text-[11px] text-accent-ember mt-1">{progress[0]}/{progress[1]}</div>
      )}
      {hover && status !== 'locked' && (
        <div className="absolute bottom-full mb-2 z-50 liquid-glass rounded-xl p-3 min-w-[160px] text-sm animate-fade-rise">
          <div className="font-display text-foreground mb-1">{title}</div>
          <div className="text-muted-foreground text-xs mb-2">{progress[0]}/{progress[1]} items</div>
          <LiquidButton size="sm" ember onClick={onClick}>
            {status === 'active' ? 'Resume' : 'Start'}
          </LiquidButton>
        </div>
      )}
    </div>
  )
}