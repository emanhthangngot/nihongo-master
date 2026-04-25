import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LiquidButton from '@/components/ui/LiquidButton'

const GOALS = [
  { id: 'jlpt',   icon: '📖', label: 'Pass JLPT (N5 → N1)',  desc: 'Structured exam prep' },
  { id: 'speak',  icon: '💬', label: 'Speak Naturally',       desc: 'Conversational fluency' },
  { id: 'travel', icon: '✈️', label: 'Travel Japan',           desc: 'Practical daily Japanese' },
  { id: 'anime',  icon: '🎌', label: 'Love Anime / Manga',    desc: 'Cultural immersion' },
]

const LEVEL_INFO: Record<string, { vocab: string; kanji: string; time: string; desc: string }> = {
  N5: { vocab: '800',    kanji: '100',   time: '~3 months',  desc: 'Absolute beginner friendly' },
  N4: { vocab: '1,500',  kanji: '300',   time: '~6 months',  desc: 'Covers basic daily conversation' },
  N3: { vocab: '3,750',  kanji: '650',   time: '~1 year',    desc: 'Intermediate everyday topics' },
  N2: { vocab: '6,000',  kanji: '1,000', time: '~2 years',   desc: 'Near-business level Japanese' },
  N1: { vocab: '10,000+',kanji: '2,000', time: '~3–4 years', desc: 'Near-native comprehension' },
}

const QUESTIONS = [
  { jp: '食べる',  gloss: 'What does this word mean?',               options: ['to drink','to sleep','to eat','to walk'],          correct: 2, jlpt: 'N5' },
  { jp: '大きい',  gloss: 'What is the meaning?',                    options: ['small','big','fast','quiet'],                       correct: 1, jlpt: 'N5' },
  { jp: 'どこ',   gloss: 'Which question word is this?',            options: ['when','who','where','what'],                        correct: 2, jlpt: 'N5' },
  { jp: '学校',   gloss: 'What does this word mean?',               options: ['company','hospital','school','station'],            correct: 2, jlpt: 'N5' },
  { jp: 'ありがとう', gloss: 'What does this expression mean?',     options: ['goodbye','thank you','sorry','good morning'],       correct: 1, jlpt: 'N5' },
  { jp: '先生が教えています', gloss: 'What is happening?',          options: ['Student learning','Teacher teaching','Teacher sleeping','Student eating'], correct: 1, jlpt: 'N4' },
  { jp: '〜てから', gloss: 'What does this grammar pattern mean?',  options: ['while doing','before doing','after doing','without doing'], correct: 2, jlpt: 'N4' },
  { jp: 'もし雨が降ったら、家にいます', gloss: 'What does this express?', options: ['A fact','A command','A wish','A conditional'], correct: 3, jlpt: 'N4' },
]

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-border z-50">
      <div className="h-full bg-accent-ember rounded-r-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }} />
    </div>
  )
}

function Step1({ onNext }: { onNext: (goal: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="w-full max-w-lg animate-fade-rise">
      <h1 className="font-display text-4xl text-foreground leading-tight">
        What brings you to Japanese?
      </h1>
      <p className="text-muted-foreground mt-3 animate-fade-rise-1">
        We'll shape your path to match your purpose.
      </p>
      <div className="grid grid-cols-2 gap-3 mt-6 animate-fade-rise-2">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => setSelected(g.id)}
            className={`liquid-glass rounded-2xl p-6 text-left transition-all cursor-pointer border ${
              selected === g.id
                ? 'border-accent-ember bg-accent-ember/10 scale-[1.02]'
                : 'border-border hover:border-white/20 hover:scale-[1.01]'
            }`}>
            <div className="text-4xl mb-3">{g.icon}</div>
            <div className="text-foreground font-medium">{g.label}</div>
            <div className="text-muted-foreground text-sm mt-1">{g.desc}</div>
          </button>
        ))}
      </div>
      <LiquidButton ember className={`w-full justify-center mt-6 animate-fade-rise-3 ${!selected ? 'opacity-40 pointer-events-none' : ''}`}
        onClick={() => selected && onNext(selected)}>
        Continue →
      </LiquidButton>
    </div>
  )
}

function Step2({ onNext }: { onNext: (level: string) => void }) {
  const [level, setLevel] = useState('N5')
  const info = LEVEL_INFO[level]
  return (
    <div className="w-full max-w-lg animate-fade-rise">
      <h1 className="font-display text-4xl text-foreground">Which level are you aiming for?</h1>
      <p className="text-muted-foreground mt-3 text-sm animate-fade-rise-1">You can always change this later.</p>
      <div className="flex gap-2 mt-5 flex-wrap animate-fade-rise-2">
        {Object.keys(LEVEL_INFO).map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`liquid-glass rounded-full px-5 py-2 text-sm transition-all border ${
              level === l ? 'border-accent-ember bg-accent-ember/15 text-foreground' : 'border-border text-muted-foreground hover:border-white/30'
            }`}>{l}</button>
        ))}
      </div>
      <div className="liquid-glass rounded-xl p-5 mt-4 border border-border animate-fade-rise-3">
        <div className="flex gap-6 flex-wrap mb-3">
          {[['Vocabulary', info.vocab + ' words'], ['Kanji', info.kanji + ' chars'], ['Study time', info.time]].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{k}</div>
              <div className="text-lg font-medium mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{info.desc}</p>
      </div>
      <LiquidButton ember className="w-full justify-center mt-6 animate-fade-rise-3" onClick={() => onNext(level)}>
        Continue →
      </LiquidButton>
    </div>
  )
}

function Step3({ goal: _goal, level: _level }: { goal: string; level: string }) {
  const navigate = useNavigate()
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  
  // If the target level is N5, they are a beginner, so skip the placement test
  const [done, setDone] = useState(_level === 'N5')
  
  const q = QUESTIONS[qIdx]
  const progress = done ? 100 : (qIdx / QUESTIONS.length) * 100

  const answer = (oi: number) => {
    if (answers[qIdx] !== undefined) return
    setAnswers((a) => ({ ...a, [qIdx]: oi }))
    setTimeout(() => {
      if (qIdx + 1 >= QUESTIONS.length) setDone(true)
      else setQIdx((i) => i + 1)
    }, 500)
  }

  const correct = Object.entries(answers).filter(([qi, oi]) => QUESTIONS[+qi].correct === oi).length
  const pct = Object.keys(answers).length > 0 ? Math.round((correct / QUESTIONS.length) * 100) : 0
  const result = _level === 'N5' ? 'N5' : pct >= 75 ? 'N4' : 'N5'

  const pathItems = [
    `Personalized ${result} skill tree`,
    'Grammar, Kanji & Vocabulary tracks',
    'SRS flashcards tuned to your level',
    'AI Tutor ready for practice',
  ]

  if (done) return (
    <div className="text-center animate-fade-rise max-w-md">
      <div className="text-5xl mb-4">🌸</div>
      <div className="font-display text-4xl leading-tight">Your path is ready.</div>
      <p className="text-muted-foreground mt-3">JLPT {result} Path</p>
      <div className="text-left mt-8 max-w-xs mx-auto space-y-0">
        {pathItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
            <span className="text-accent-jade text-sm">✓</span>
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
      <LiquidButton ember className="mt-8 mx-auto" onClick={() => navigate('/learning-path')}>
        Begin Learning →
      </LiquidButton>
    </div>
  )

  return (
    <div className="w-full max-w-lg">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-border z-50">
        <div className="h-full bg-accent-ember transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mb-6 animate-fade-rise">
        Question {qIdx + 1} of {QUESTIONS.length}
      </div>
      <div className="text-center mb-8 animate-fade-rise">
        <div className="jp text-5xl text-foreground">{q.jp}</div>
        <div className="font-display text-lg text-muted-foreground mt-2">{q.gloss}</div>
      </div>
      <div className="space-y-3">
        {q.options.map((opt, oi) => {
          const answered = answers[qIdx] !== undefined
          const cls = answered
            ? oi === q.correct ? 'border-accent-jade bg-accent-jade/10'
              : oi === answers[qIdx] ? 'border-red-500/60 bg-red-500/8'
              : 'border-border opacity-50'
            : 'border-border hover:border-white/25 hover:bg-white/4'
          return (
            <button key={oi} onClick={() => answer(oi)}
              className={`w-full liquid-glass rounded-xl p-4 text-left text-sm border transition-all ${cls}`}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState<1|2|3>(1)
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('N5')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--accent-ember)/0.08) 0%, transparent 60%), hsl(var(--background))' }}>
      <ProgressBar step={step - 1} total={2} />
      <a href="/" className="fixed top-5 left-8 font-display text-xl">
        Nihongo<span className="text-muted-foreground">Master</span>
      </a>

      {step === 1 && <Step1 onNext={(g) => { setGoal(g); setStep(g === 'jlpt' ? 2 : 3) }} />}
      {step === 2 && <Step2 onNext={(l) => { setLevel(l); setStep(3) }} />}
      {step === 3 && <Step3 goal={goal} level={level} />}
    </div>
  )
}