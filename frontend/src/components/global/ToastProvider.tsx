import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'achievement'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (msg: string, type?: ToastType) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

const typeStyles: Record<ToastType, string> = {
  success:     'border-accent-jade/40 text-foreground',
  error:       'border-red-500/40 text-foreground',
  info:        'border-border text-foreground',
  achievement: 'border-accent-ember/50 text-foreground',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t.slice(-2), { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={cn('pointer-events-auto liquid-glass rounded-xl px-4 py-3 text-sm min-w-[220px] border animate-slide-in-right', typeStyles[t.type])}>
            {t.type === 'achievement' && <span className="mr-2">🏆</span>}
            {t.type === 'success'     && <span className="mr-2 text-accent-jade">✓</span>}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}