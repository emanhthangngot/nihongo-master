interface ProgressRingProps {
  value: number      // 0–100
  size?: number
  strokeWidth?: number
  label?: string
  color?: string
}

export default function ProgressRing({
  value, size = 80, strokeWidth = 6, label, color = 'hsl(var(--accent-ember))',
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%',
                   fill: 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)', fontSize: size * 0.18 }}>
          {value}%
        </text>
      </svg>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}