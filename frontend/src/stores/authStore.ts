import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  setUser: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setUser: (user, token) =>
        set({ user, token, isLoggedIn: true }),

      clearAuth: () =>
        set({ user: null, token: null, isLoggedIn: false }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: 'nihongo-auth' }
  )
)