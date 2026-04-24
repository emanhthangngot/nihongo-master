import { useAudio } from '@/hooks/useAudio'

interface AudioButtonProps { text: string; size?: number; className?: string }

export default function AudioButton({ text, size = 16, className }: AudioButtonProps) {
  const { play } = useAudio()
  return (
    <button
      onClick={(e) => { e.stopPropagation(); play(text) }}
      className={`text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0 ${className ?? ''}`}
      title="Play audio"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    </button>
  )
}