export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface SRSCard {
  id: string
  word: string
  reading: string
  meaning: string
  examples: { jp: string; en: string }[]
  interval: number      // days until next review
  ease: number          // multiplier, default 2.5
  dueDate: string       // ISO date string
  lapses: number        // times rated "again"
  retention: number     // 0–1 estimated recall probability
  type: 'vocab' | 'grammar' | 'kanji'
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
}

export interface DueQueue {
  due: SRSCard[]
  newCards: SRSCard[]
  totalToday: number
  dailyGoal: number
}

export interface ReviewSession {
  cards: SRSCard[]
  ratings: { cardId: string; rating: ReviewRating }[]
  startedAt: string
  completedAt?: string
}

/** FSRS-5 stability/difficulty state stored per card */
export interface FSRSState {
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: 0 | 1 | 2 | 3   // New | Learning | Review | Relearning
}