import { cn } from '@/lib/utils'

interface XPBarProps {
  current: number
  max: number
  className?: string
  color?: string
}

export default function XPBar({ current, max, className, color }: XPBarProps) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div className={cn('h-1 rounded-full bg-border overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color ?? 'hsl(var(--accent-ember))' }}
      />
    </div>
  )
}