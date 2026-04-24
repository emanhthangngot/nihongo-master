import { useEffect, useState } from 'react'
import AudioButton from './AudioButton'
import LiquidButton from './LiquidButton'

interface PopoverData {
  word: string; reading: string; pos: string
  jlpt: string; meaning: string
  x: number; y: number
}

export default function QuickLookupPopover() {
  const [data, setData] = useState<PopoverData | null>(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection()
      if (!sel || !sel.toString().trim()) { setData(null); return }
      const text = sel.toString().trim()
      if (!/[　-鿿]/.test(text)) return
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      // Stub: in production, call API for real dictionary data
      setData({ word: text, reading: '...', pos: 'word', jlpt: 'N?', meaning: '…',
        x: rect.left, y: rect.bottom + window.scrollY + 8 })
      setAdded(false)
    }
    document.addEventListener('mouseup', handler)
    return () => document.removeEventListener('mouseup', handler)
  }, [])

  if (!data) return null

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={() => setData(null)} />
      <div
        className="liquid-glass rounded-xl p-4 max-w-xs z-[100] shadow-2xl animate-fade-rise"
        style={{ position: 'absolute', left: Math.min(data.x, window.innerWidth - 280), top: data.y }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="jp text-xl text-foreground">{data.word}</span>
          <AudioButton text={data.word} />
        </div>
        <div className="mono text-xs text-muted-foreground">{data.reading} · {data.pos}</div>
        <div className="text-sm text-foreground mt-2">{data.meaning}</div>
        <div className="flex gap-2 mt-3">
          <LiquidButton size="sm" ember onClick={() => setAdded(true)}>
            {added ? '✓ Added' : '+ SRS'}
          </LiquidButton>
          <LiquidButton size="sm">Full Entry →</LiquidButton>
        </div>
      </div>
    </>
  )
}