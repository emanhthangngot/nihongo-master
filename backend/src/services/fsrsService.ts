/**
 * Simplified FSRS-5 grading logic.
 * For production, use the official fsrs-ts package.
 */

type Rating = 'again' | 'hard' | 'good' | 'easy'

interface CardState {
  interval: number
  ease: number
  lapses: number
  retention: number
  due_date: string
}

export function fsrsGrade(card: CardState, rating: Rating): Partial<CardState> {
  const ease = Math.max(1.3, card.ease + { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[rating])
  const intervals: Record<Rating, number> = {
    again: 1,
    hard:  Math.max(1, Math.floor(card.interval * 0.8)),
    good:  Math.round(card.interval * ease),
    easy:  Math.round(card.interval * ease * 1.3),
  }
  const interval = intervals[rating]
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)

  return {
    interval,
    ease,
    lapses: rating === 'again' ? card.lapses + 1 : card.lapses,
    retention: { again: 0.4, hard: 0.6, good: 0.85, easy: 0.95 }[rating],
    due_date: dueDate.toISOString().slice(0, 10),
  }
}