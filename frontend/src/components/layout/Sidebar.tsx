import { cn } from '@/lib/utils'

interface SidebarProps {
  children: React.ReactNode
  className?: string
  width?: string
}

export default function Sidebar({ children, className, width = 'w-60' }: SidebarProps) {
  return (
    <aside className={cn('hidden md:flex flex-col flex-shrink-0 border-r border-border overflow-y-auto', width, className)}>
      {children}
    </aside>
  )
}