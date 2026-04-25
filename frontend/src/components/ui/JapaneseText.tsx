import { useFurigana } from '@/hooks/useFurigana'
import { cn } from '@/lib/utils'

interface JapaneseTextProps {
  children: string
  furigana?: string
  className?: string
}

export default function JapaneseText({ children, furigana, className }: JapaneseTextProps) {
  const showFurigana = useFurigana()
  const base = cn('jp', className)
  if (showFurigana && furigana) {
    return (
      <ruby className={base}>
        {children}
        <rt className="text-xs text-muted-foreground">{furigana}</rt>
      </ruby>
    )
  }
  return <span className={base}>{children}</span>
}