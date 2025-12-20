import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    email: string
    username?: string  // 可选，管理员账号可能没有
    points: number
    avatar_url?: string
    is_admin?: boolean
}

interface UserStore {
    user: User | null
    setUser: (user: User | null) => void
    updatePoints: (points: number) => void
    logout: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            updatePoints: (points) => set((state) =>
                state.user ? { user: { ...state.user, points } } : state
            ),
            logout: () => set({ user: null })
        }),
        {
            name: 'user-storage'
        }
    )
)
