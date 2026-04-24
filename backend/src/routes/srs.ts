import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getDueQueue, gradeCard, addCard, getStats } from '../controllers/srsController'

export const srsRouter = Router()
srsRouter.use(requireAuth)
srsRouter.get('/queue',         getDueQueue)
srsRouter.post('/grade/:cardId',gradeCard)
srsRouter.post('/cards',        addCard)
srsRouter.get('/stats',         getStats)