interface RadicalCardProps {
  char: string
  name: string
  meaning: string
}

export default function RadicalCard({ char, name, meaning }: RadicalCardProps) {
  return (
    <div className="liquid-glass rounded-xl p-4 text-center min-w-[80px]">
      <div className="jp text-3xl text-foreground">{char}</div>
      <div className="text-xs text-muted-foreground mt-1">{name}</div>
      <div className="text-xs text-accent-ember/80 mt-0.5">{meaning}</div>
    </div>
  )
}