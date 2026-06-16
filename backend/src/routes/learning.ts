import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getLearningPath, getLessons, getLesson, completeLesson, seedInitialPath, getRecommendedNodes
} from '../controllers/learningController'

export const learningRouter = Router()
learningRouter.use(requireAuth)

learningRouter.get('/path',                        getLearningPath)
learningRouter.get('/recommendations',             getRecommendedNodes)
learningRouter.get('/lessons',                     getLessons)
learningRouter.get('/lessons/:lessonNumber',       getLesson)
learningRouter.post('/lessons/:lessonNumber/complete', completeLesson)
learningRouter.post('/seed',                       seedInitialPath)
