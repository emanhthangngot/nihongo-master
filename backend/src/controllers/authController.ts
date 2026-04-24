import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const RegisterSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8),
  displayName: z.string().min(2),
})

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
}
function signRefresh(userId: string) {
  return jwt.sign({ sub: userId, type: 'refresh' }, process.env.JWT_SECRET!, { expiresIn: '30d' })
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = RegisterSchema.parse(req.body)
    const hash = await bcrypt.hash(body.password, 12)

    const { data: user, error } = await supabase
      .from('users').insert({ email: body.email, password_hash: hash, display_name: body.displayName })
      .select('id, email, display_name').single()
    if (error) throw Object.assign(new Error(error.message), { status: 400 })

    res.status(201).json({
      user, token: signToken(user.id), refreshToken: signRefresh(user.id)
    })
  } catch (err) { next(err) }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body
    const { data: user } = await supabase
      .from('users').select('id, email, password_hash, display_name').eq('email', email).single()
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const { password_hash: _, ...safe } = user
    res.json({ user: safe, token: signToken(user.id), refreshToken: signRefresh(user.id) })
  } catch (err) { next(err) }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { sub: string; type: string }
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'Invalid token' })
    res.json({ token: signToken(payload.sub) })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

export async function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out' })
}