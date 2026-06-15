import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  user_id: string
  username: string
  role_type: 'student' | 'teacher' | 'admin'
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

interface AnimationState {
  currentStep: number
  isPlaying: boolean
  speed: number
  setCurrentStep: (step: number) => void
  setIsPlaying: (playing: boolean) => void
  setSpeed: (speed: number) => void
  resetAnimation: () => void
}

// 认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

// 主题状态管理
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (isDark) => set({ isDark }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

// 动画状态管理
export const useAnimationStore = create<AnimationState>()(
  (set) => ({
    currentStep: 0,
    isPlaying: false,
    speed: 1,
    setCurrentStep: (step) => set({ currentStep: step }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setSpeed: (speed) => set({ speed }),
    resetAnimation: () => set({ currentStep: 0, isPlaying: false }),
  })
)