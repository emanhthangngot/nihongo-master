import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getProfile, updateProfile, getProgress, getDailyQuests } from '../controllers/userController'

export const userRouter = Router()
userRouter.use(requireAuth)
userRouter.get('/profile',      getProfile)
userRouter.patch('/profile',    updateProfile)
userRouter.get('/progress',     getProgress)
userRouter.get('/daily-quests', getDailyQuests)