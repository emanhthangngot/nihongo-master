import { useSettingsStore } from '@/stores/settingsStore'

/** Returns the current furigana preference from settings store. */
export function useFurigana(): boolean {
  return useSettingsStore((s) => s.furigana)
}