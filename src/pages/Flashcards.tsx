import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import JapaneseText from '@/components/ui/JapaneseText'
import AudioButton from '@/components/ui/AudioButton'
import LiquidButton from '@/components/ui/LiquidButton'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import type { ReviewRating } from '@/types/srs'

const CARDS = [
  { id:'1', word:'食べる', reading:'たべる', romaji:'taberu', meaning:'to eat', pos:'verb (godan)', jlpt:'N5',
    examples:[{jp:'毎日野菜を食べる。',en:'I eat vegetables every day.'},{jp:'もっと食べたい。',en:'I want to eat more.'},{jp:'何を食べましたか？',en:'What did you eat?'}] },
  { id:'2', word:'勉強', reading:'べんきょう', romaji:'benkyō', meaning:'study', pos:'noun / suru-verb', jlpt:'N5',
    examples:[{jp:'毎日日本語を勉強する。',en:'I study Japanese every day.'},{jp:'勉強は大切だ。',en:'Studying is important.'},{jp:'何時間勉強しましたか？',en:'How many hours did you study?'}] },
  { id:'3', word:'難しい', reading:'むずかしい', romaji:'muzukashii', meaning:'difficult; hard', pos:'i-adjective', jlpt:'N5',
    examples:[{jp:'この問題は難しい。',en:'This problem is difficult.'},{jp:'日本語は難しくない。',en:'Japanese is not difficult.'},{jp:'難しい質問だ。',en:"That's a hard question."}] },
  { id:'4', word:'先生', reading:'せんせい', romaji:'sensei', meaning:'teacher; master', pos:'noun', jlpt:'N5',
    examples:[{jp:'先生はどこですか？',en:'Where is the teacher?'},{jp:'田中先生は優しい。',en:'Teacher Tanaka is kind.'},{jp:'先生に聞いてください。',en:'Please ask the teacher.'}] },
  { id:'5', word:'分かる', reading:'わかる', romaji:'wakaru', meaning:'to understand', pos:'verb (godan)', jlpt:'N5',
    examples:[{jp:'分かりますか？',en:'Do you understand?'},{jp:'全然分からない。',en:"I don't understand at all."},{jp:'今は分かった。',en:'Now I understand.'}] },
]

type Card = typeof CARDS[0]

function FlashCard({ card, onRate }: { card: Card; onRate: (r: ReviewRating) => void }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => { setFlipped(false) }, [card.id])

  useKeyboardShortcut({
    ' ': () => setFlipped((f) => !f),
    '1': () => { if (flipped) onRate('again') },
    '2': () => { if (flipped) onRate('hard') },
    '3': () => { if (flipped) onRate('good') },
    '4': () => { if (flipped) onRate('easy') },
  })

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ perspective: '1200px' }}>
      <div className="w-full max-w-lg" style={{ perspective: '1200px' }}>
        <div
          className="relative min-h-80 cursor-pointer"
          style={{ transformStyle: 'preserve-3d', transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div className="absolute inset-0 liquid-glass rounded-3xl flex flex-col items-center justify-center p-10 border border-white/10"
            style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-xs px-2 py-0.5 rounded-full border mb-6 text-green-300 border-green-300/40 bg-green-300/8">{card.jlpt}</span>
            <JapaneseText className="text-7xl">{card.word}</JapaneseText>
            <p className="text-muted-foreground text-sm mt-8 animate-blink">tap to reveal</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 liquid-glass rounded-3xl p-8 border border-white/12 flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-1">
              <JapaneseText className="text-4xl">{card.word}</JapaneseText>
              <AudioButton text={card.word} size={20} />
            </div>
            <p className="mono text-sm text-muted-foreground">{card.romaji} · {card.pos}</p>
            <hr className="border-border my-4" />
            <p className="font-display text-3xl leading-tight">{card.meaning}</p>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Example sentences</p>
              {card.examples.map((ex, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-center gap-2">
                    <JapaneseText className="text-sm">{ex.jp}</JapaneseText>
                    <AudioButton text={ex.jp} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ex.en}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-auto pt-4">
              {([
                ['Again','border-red-500/50 bg-red-500/6','again'],
                ['Hard', 'border-amber-500/50 bg-amber-500/6','hard'],
                ['Good', 'border-accent-jade/40 bg-accent-jade/6','good'],
                ['Easy', 'border-accent-jade bg-accent-jade/12 font-medium','easy'],
              ] as const).map(([label, cls, rating]) => (
                <button key={label} onClick={() => onRate(rating as ReviewRating)}
                  className={`flex-1 py-3 rounded-xl text-sm border liquid-glass text-foreground transition-transform hover:scale-105 ${cls}`}>
                  {label}
                  <div className="text-[10px] opacity-50 mt-0.5">[{['1','2','3','4'][['again','hard','good','easy'].indexOf(rating)]}]</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Flashcards() {
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [ratings, setRatings] = useState<{ word: string; rating: ReviewRating }[]>([])
  const total = CARDS.length
  const progress = idx / total

  const onRate = useCallback((rating: ReviewRating) => {
    setRatings((r) => [...r, { word: CARDS[idx].word, rating }])
    if (idx + 1 >= total) setDone(true)
    else setIdx((i) => i + 1)
  }, [idx, total])

  if (done) {
    const pct = Math.round(ratings.filter(r => r.rating === 'good' || r.rating === 'easy').length / total * 100)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 animate-fade-rise">
        <div className="jp text-8xl text-muted-foreground/30">完了</div>
        <h2 className="font-display text-4xl mt-4">Session Complete!</h2>
        <p className="text-muted-foreground mt-2">{total} cards · {pct}% correct</p>
        <div className="flex gap-3 mt-8">
          <LiquidButton ember onClick={() => { setIdx(0); setDone(false); setRatings([]) }}>Review Again</LiquidButton>
          <LiquidButton as="a" href="/dashboard">← Dashboard</LiquidButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%,hsl(var(--accent-ember)/0.06) 0%,transparent 60%),hsl(var(--background))' }}>
      {/* Progress line */}
      <div className="h-[3px] bg-border relative">
        <div className="absolute left-0 top-0 h-full bg-accent-ember rounded-r-full transition-all duration-400"
          style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-white/6">
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Due: <strong className="text-foreground">47</strong></span>
          <span>Session: <strong className="text-foreground">{idx + 1}/{total}</strong></span>
        </div>
        <span className="jp text-muted-foreground">{CARDS[idx].word}</span>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">⏸ Pause</Link>
      </div>

      <FlashCard card={CARDS[idx]} onRate={onRate} />

      <p className="text-center text-xs text-white/20 tracking-widest pb-6">
        Space — flip &nbsp;·&nbsp; 1 Again &nbsp;·&nbsp; 2 Hard &nbsp;·&nbsp; 3 Good &nbsp;·&nbsp; 4 Easy
      </p>
    </div>
  )
}