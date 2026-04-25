interface PitchAccentGraphProps {
  morae: string[]
  pattern: number[]   // 0=low, 1=high per mora
  patternName?: string
}

export default function PitchAccentGraph({ morae, pattern, patternName }: PitchAccentGraphProps) {
  const W = 44, HIGH = 8, LOW = 34
  const points = morae.map((_, i) => ({ x: i * W + 22, y: pattern[i] ? HIGH : LOW }))
  const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')

  return (
    <div>
      <svg width={morae.length * W + 22} height={56} style={{ overflow: 'visible' }}>
        <path d={d} stroke="hsl(var(--accent-ember))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="hsl(var(--accent-ember))"/>
            <text x={p.x} y={52} textAnchor="middle" fontSize="12"
              fill="hsl(var(--muted-foreground))" fontFamily="var(--font-jp)">{morae[i]}</text>
          </g>
        ))}
      </svg>
      {patternName && (
        <p className="text-xs text-muted-foreground mt-1">{patternName}</p>
      )}
    </div>
  )
}