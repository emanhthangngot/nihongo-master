import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { authRouter }       from './routes/auth'
import { srsRouter }        from './routes/srs'
import { dictionaryRouter } from './routes/dictionary'
import { userRouter }       from './routes/user'
import { chatRouter }       from './routes/chat'
import { notebookRouter }   from './routes/notebook'
import { learningRouter }   from './routes/learning'
import { errorHandler }     from './middleware/errorHandler'
import { notFound }         from './middleware/notFound'

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter)
app.use('/api/srs',        srsRouter)
app.use('/api/dictionary', dictionaryRouter)
app.use('/api/user',       userRouter)
app.use('/api/chat',       chatRouter)
app.use('/api/notebook',   notebookRouter)
app.use('/api/learning',   learningRouter)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ─── Error handling ────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`))
export default app