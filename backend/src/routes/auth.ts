import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/authController'
import { authLimiter } from '../middleware/rateLimiter'

export const authRouter = Router()
authRouter.post('/register', authLimiter, register)
authRouter.post('/login',    authLimiter, login)
authRouter.post('/refresh',  refresh)
authRouter.post('/logout',   logout)