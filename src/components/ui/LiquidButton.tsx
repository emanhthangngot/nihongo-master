import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LiquidButtonProps {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  ember?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  as?: 'button' | 'a'
  href?: string
}

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-14 py-5 text-base',
}

export default function LiquidButton({
  children, onClick, size = 'md', ember = false,
  className, disabled = false, type = 'button', as = 'button', href,
}: LiquidButtonProps) {
  const navigate = useNavigate()

  const base = cn(
    'liquid-glass rounded-full text-foreground transition-transform',
    'hover:scale-[1.03] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2',
    sizeMap[size],
    ember && 'border border-accent-ember/60 shadow-[0_0_12px_hsl(var(--accent-ember)/0.3)]',
    disabled && 'opacity-40 pointer-events-none',
    className,
  )

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    if (onClick) onClick()
    if (as === 'a' && href) {
      if (href.startsWith('http') || href.startsWith('//')) {
        return // Let default <a> behavior handle external links
      }
      e.preventDefault()
      navigate(href)
    }
  }

  if (as === 'a') {
    return (
      <a href={href} className={base} onClick={handleClick}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={base} onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  )
}