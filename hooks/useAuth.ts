import { create } from 'zustand'
import { User } from '@/lib/types'

interface AuthState {
    user: User | null
    setUser: (user: User | null) => void
    points: number
    setPoints: (points: number) => void
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user, points: user?.points || 0 }),
    points: 0,
    setPoints: (points) => set({ points }),
}))
