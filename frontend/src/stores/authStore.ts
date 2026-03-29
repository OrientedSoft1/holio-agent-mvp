import { create } from 'zustand'

interface User {
  id: string
  phone: string
  username: string | null
  firstName: string
  lastName: string | null
  bio: string | null
  avatarUrl: string | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isAuthenticated: typeof localStorage !== 'undefined' && !!localStorage.getItem('accessToken'),
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('activeCompany')
    localStorage.removeItem('holio-dark-mode')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
    window.location.href = '/login'
  }
}))
