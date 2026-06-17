import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SRSCard, ReviewRating } from '@/types/srs'
import type { Streak, XPRecord, DailyQuest } from '@/types/user'

const LEVEL_TITLES = [
  'Beginner','Student','Learner','Seeker','Scholar',
  'Apprentice','Practitioner','Expert','Master','Sensei',
]

interface LearningState {
  xp: XPRecord
  streak: Streak
  srsQueue: SRSCard[]
  todayReviewed: number
  dailyQuests: DailyQuest[]
  isLoading: boolean

  addXP: (amount: number) => void
  updateStreak: () => void
  setSRSQueue: (cards: SRSCard[]) => void
  incrementReviewed: () => void
  fetchStats: () => Promise<void>
  fetchSRSQueue: () => Promise<void>
}

function calcLevel(totalXP: number): XPRecord {
  const level = Math.min(9, Math.floor(totalXP / 1000))
  const currentXP = totalXP % 1000
  return { level: level + 1, currentXP, nextLevelXP: 1000, totalXP, levelTitle: LEVEL_TITLES[level] }
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      xp: calcLevel(0),
      streak: {
        current: 0,
        longest: 0,
        lastStudyDate: '',
        weekDays: [false, false, false, false, false, false, false],
      },
      srsQueue: [],
      todayReviewed: 0,
      dailyQuests: [],
      isLoading: false,

      addXP: (amount) =>
        set((s) => ({ xp: calcLevel(s.xp.totalXP + amount) })),

      updateStreak: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10)
          if (s.streak.lastStudyDate === today) return s
          return {
            streak: {
              ...s.streak,
              current: s.streak.current + 1,
              longest: Math.max(s.streak.longest, s.streak.current + 1),
              lastStudyDate: today,
            },
          }
        }),

      setSRSQueue: (cards) => set({ srsQueue: cards }),

      incrementReviewed: () => set((s) => ({ todayReviewed: s.todayReviewed + 1 })),

      fetchStats: async () => {
        const { default: api } = await import('@/services/api')
        set({ isLoading: true })
        try {
          const { data } = await api.get('/user/stats')
          set({
            xp: calcLevel(data.total_xp),
            streak: {
              current: data.streak,
              longest: data.longest_streak,
              lastStudyDate: data.last_study_date,
              weekDays: data.week_days ?? [false, false, false, false, false, false, false],
            }
          })
          const { data: quests } = await api.get('/user/daily-quests')
          set({ dailyQuests: quests })
        } catch (err) {
          console.error('Failed to fetch stats:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSRSQueue: async () => {
        const { default: api } = await import('@/services/api')
        try {
          const { data } = await api.get('/srs/queue')
          set({ srsQueue: data })
        } catch (err) {
          console.error('Failed to fetch SRS queue:', err)
        }
      }
    }),
    { name: 'nihongo-learning' }
  )
)