import api from './api'

export interface LearningNode {
  id: string
  title: string
  description: string
  jlpt_level: string
  sort_order: number
  type: 'grammar' | 'kanji' | 'vocab'
  userProgress?: {
    status: 'locked' | 'available' | 'active' | 'completed'
    progress_current: number
    progress_total: number
  }
}

export interface LearningEdge {
  from_node: string
  to_node: string
}

export interface Lesson {
  id: string
  lesson_number: number
  title: string
  description: string
  is_milestone: boolean
  userProgress: {
    status: 'locked' | 'available' | 'completed'
    score?: number
  }
}

export const learningService = {
  async getPath(level?: string): Promise<{ nodes: LearningNode[]; edges: LearningEdge[] }> {
    const params = level ? `?level=${level}` : ''
    const { data } = await api.get(`/learning/path${params}`)
    return data
  },

  async getLessons(): Promise<Lesson[]> {
    const { data } = await api.get('/learning/lessons')
    return data
  },

  async getLesson(lessonNumber: number) {
    const { data } = await api.get(`/learning/lessons/${lessonNumber}`)
    return data
  },

  async completeLesson(lessonNumber: number, score: number) {
    const { data } = await api.post(`/learning/lessons/${lessonNumber}/complete`, { score })
    return data
  },

  async getRecommendations(): Promise<LearningNode[]> {
    const { data } = await api.get('/learning/recommendations')
    return data
  }
}
