import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import RadicalCard from '@/components/ui/RadicalCard'
import AudioButton from '@/components/ui/AudioButton'
import LiquidButton from '@/components/ui/LiquidButton'
import { useToast } from '@/components/global/ToastProvider'

const STUB = {
  char:'食', on:['ショク','ジキ'], kun:['た(べる)','く(う)'],
  meanings:['eat','food','meal'],
  strokeCount:9, jlpt:'N5',
  radicals:[
    {char:'𠆢',name:'hitoyane',meaning:'person'},
    {char:'良',name:'yoi',meaning:'good'},
  ],
  mnemonic:'A person (𠆢) who is good (良) at preparing food.',
  words:['食べる','食堂','食事','朝食','夕食','食料'],
}

export default function KanjiDetail() {
  const { char } = useParams()
  const { toast } = useToast()
  const k = STUB

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/dictionary" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex">← Dictionary</Link>

        {/* Big kanji */}
        <div className="text-center mb-8 animate-fade-rise">
          <div className="jp text-[9rem] leading-none text-foreground">{k.char}</div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div><p className="text-xs text-muted-foreground uppercase mb-1">On</p>
              <p className="mono text-accent-ember">{k.on.join('、')}</p></div>
            <div><p className="text-xs text-muted-foreground uppercase mb-1">Kun</p>
              <p className="mono text-muted-foreground">{k.kun.join('、')}</p></div>
            <div><p className="text-xs text-muted-foreground uppercase mb-1">Strokes</p>
              <p className="font-display text-lg">{k.strokeCount}</p></div>
            <span className="text-xs px-2 py-0.5 rounded-full border text-green-300 border-green-300/40 bg-green-300/8">{k.jlpt}</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Meanings */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/8 animate-fade-rise-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Meanings</p>
            <div className="flex gap-3 flex-wrap">
              {k.meanings.map(m => (
                <span key={m} className="font-display text-xl">{m}</span>
              ))}
            </div>
          </div>

          {/* Radical breakdown */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/8 animate-fade-rise-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Radical Breakdown</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {k.radicals.map((r, i) => (
                <div key={i} className="flex items-center gap-4">
                  <RadicalCard char={r.char} name={r.name} meaning={r.meaning} />
                  {i < k.radicals.length - 1 && <span className="text-2xl text-muted-foreground">+</span>}
                </div>
              ))}
              <span className="text-2xl text-muted-foreground">=</span>
              <div className="liquid-glass rounded-xl p-4 text-center">
                <div className="jp text-4xl">{k.char}</div>
              </div>
            </div>
            {k.mnemonic && (
              <p className="font-display italic text-lg text-muted-foreground mt-5 max-w-lg mx-auto text-center">{k.mnemonic}</p>
            )}
          </div>

          {/* Stroke order placeholder */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/8 animate-fade-rise-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Stroke Order</p>
            <div className="w-48 h-48 mx-auto rounded-xl bg-white/4 border border-border flex items-center justify-center">
              <span className="jp text-7xl opacity-20">{k.char}</span>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <LiquidButton size="sm">▶ Play</LiquidButton>
              <LiquidButton size="sm">⏮ Reset</LiquidButton>
            </div>
          </div>

          {/* Words */}
          <div className="liquid-glass rounded-2xl p-6 border border-white/8 animate-fade-rise-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Words Using {k.char}</p>
            <div className="flex flex-wrap gap-2">
              {k.words.map(w => (
                <Link key={w} to={`/dictionary/${encodeURIComponent(w)}`}
                  className="liquid-glass rounded-full px-4 py-1.5 jp text-lg border border-border hover:border-accent-ember/40 transition-colors">
                  {w}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}