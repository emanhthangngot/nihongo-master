import { useMemo } from 'react'

interface HeatmapCalendarProps {
  data: Record<string, number>   // ISO date → card count
}

function cellColor(n: number) {
  if (!n)   return 'hsl(var(--border))'
  if (n < 6)  return 'hsl(var(--accent-ember)/0.25)'
  if (n < 16) return 'hsl(var(--accent-ember)/0.5)'
  if (n < 31) return 'hsl(var(--accent-ember)/0.75)'
  return 'hsl(var(--accent-ember))'
}

export default function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const cells = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 52 * 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (52 * 7 - 1 - i))
      const iso = d.toISOString().slice(0, 10)
      return { date: iso, count: data[iso] ?? 0 }
    })
  }, [data])

  return (
    <div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(52, 1fr)' }}>
        {cells.map((c, i) => (
          <div key={i} title={`${c.date}: ${c.count} cards`}
            className="aspect-square rounded-[2px] cursor-pointer hover:opacity-70 transition-opacity"
            style={{ background: cellColor(c.count) }} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {[0,3,8,20,35].map((n) => (
          <div key={n} className="w-3 h-3 rounded-[2px]" style={{ background: cellColor(n) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}