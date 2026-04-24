export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  jlptTarget: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  learningGoal: 'jlpt' | 'speak' | 'travel' | 'anime'
  createdAt: string
}

export interface XPRecord {
  level: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
  levelTitle: string
}

export interface Streak {
  current: number
  longest: number
  lastStudyDate: string | null
  weekDays: boolean[]   // [Mon … Sun]
}

export interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  unlockedAt?: string
  icon: string
}

export interface DailyQuest {
  id: string
  title: string
  xpReward: number
  target: number
  current: number
  completed: boolean
}