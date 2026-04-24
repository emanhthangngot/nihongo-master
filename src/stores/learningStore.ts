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

  addXP: (amount: number) => void
  updateStreak: () => void
  setSRSQueue: (cards: SRSCard[]) => void
  gradeCard: (cardId: string, rating: ReviewRating) => void
  incrementReviewed: () => void
}

function calcLevel(totalXP: number): XPRecord {
  const level = Math.min(9, Math.floor(totalXP / 1000))
  const currentXP = totalXP % 1000
  return { level: level + 1, currentXP, nextLevelXP: 1000, totalXP, levelTitle: LEVEL_TITLES[level] }
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      xp: calcLevel(1240),
      streak: {
        current: 12,
        longest: 21,
        lastStudyDate: new Date().toISOString().slice(0, 10),
        weekDays: [true, true, true, true, true, false, false],
      },
      srsQueue: [],
      todayReviewed: 0,
      dailyQuests: [
        { id: 'review20', title: 'Review 20 flashcards', xpReward: 30, target: 20, current: 14, completed: false },
        { id: 'read1',    title: 'Complete 1 reading',   xpReward: 50, target: 1,  current: 0,  completed: false },
        { id: 'tutor5',   title: 'Chat with AI Tutor',   xpReward: 40, target: 5,  current: 0,  completed: false },
        { id: 'kanji5',   title: 'Learn 5 new kanji',    xpReward: 60, target: 5,  current: 0,  completed: false },
      ],

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

      gradeCard: (cardId, rating) =>
        set((s) => ({
          srsQueue: s.srsQueue.map((c) => {
            if (c.id !== cardId) return c
            const intervals: Record<ReviewRating, number> = {
              again: 1, hard: Math.max(1, c.interval - 1),
              good: Math.round(c.interval * c.ease),
              easy: Math.round(c.interval * c.ease * 1.3),
            }
            return { ...c, interval: intervals[rating], lapses: rating === 'again' ? c.lapses + 1 : c.lapses }
          }),
        })),

      incrementReviewed: () => set((s) => ({ todayReviewed: s.todayReviewed + 1 })),
    }),
    { name: 'nihongo-learning' }
  )
)