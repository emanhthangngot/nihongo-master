import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  getLearningPath, getLessons, getLesson, completeLesson, seedInitialPath,
} from '../controllers/learningController'

export const learningRouter = Router()
learningRouter.use(requireAuth)

learningRouter.get('/path',                        getLearningPath)
learningRouter.get('/lessons',                     getLessons)
learningRouter.get('/lessons/:lessonNumber',       getLesson)
learningRouter.post('/lessons/:lessonNumber/complete', completeLesson)
learningRouter.post('/seed',                       seedInitialPath)
