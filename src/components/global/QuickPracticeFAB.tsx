import { useState } from 'react'
import LiquidButton from '@/components/ui/LiquidButton'

export default function QuickPracticeFAB() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full liquid-glass flex items-center justify-center text-2xl shadow-lg border border-accent-ember/30 animate-pulse-glow"
      >＋</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative liquid-glass rounded-2xl p-6 w-full max-w-sm animate-fade-rise">
            <h3 className="font-display text-xl mb-4">Quick Practice</h3>
            <p className="text-sm text-muted-foreground mb-4">5-card quick drill from your due queue.</p>
            <LiquidButton ember className="w-full justify-center" onClick={() => setOpen(false)}>
              Start 5-Card Drill
            </LiquidButton>
          </div>
        </div>
      )}
    </>
  )
}