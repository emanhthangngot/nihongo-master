import { useSettingsStore } from '@/stores/settingsStore'

export default function FuriganaToggle() {
  const { furigana, toggleFurigana } = useSettingsStore()
  return (
    <button
      onClick={toggleFurigana}
      className={`jp text-sm px-2 py-1 rounded-lg transition-colors ${
        furigana ? 'text-accent-ember bg-accent-ember/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
      title="Toggle furigana"
    >あ</button>
  )
}