import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { createRateLimiter } from '../middleware/rateLimiter'
import { streamChat, getConversations, createConversation, getMessages } from '../controllers/chatController'

export const chatRouter = Router()
chatRouter.use(requireAuth)

chatRouter.post('/stream', createRateLimiter(20, 60000), streamChat)
chatRouter.get('/conversations', getConversations)
chatRouter.post('/conversations', createConversation)
chatRouter.get('/conversations/:convId/messages', getMessages)
