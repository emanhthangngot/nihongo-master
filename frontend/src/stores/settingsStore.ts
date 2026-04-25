import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  furigana: boolean
  theme: 'dark' | 'light'
  autoplayAudio: boolean
  dailyGoal: number          // cards per day
  toggleFurigana: () => void
  setTheme: (t: 'dark' | 'light') => void
  setDailyGoal: (n: number) => void
  setAutoplayAudio: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      furigana: true,
      theme: 'dark',
      autoplayAudio: false,
      dailyGoal: 20,

      toggleFurigana: () => set((s) => ({ furigana: !s.furigana })),
      setTheme: (theme) => set({ theme }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setAutoplayAudio: (autoplayAudio) => set({ autoplayAudio }),
    }),
    { name: 'nihongo-settings' }
  )
)