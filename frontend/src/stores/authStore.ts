import { create } from 'zustand'
import api from '../services/api.service'
import type { User } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isAuthenticated: typeof localStorage !== 'undefined' && !!localStorage.getItem('accessToken'),
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },
  fetchMe: async () => {
    if (!get().accessToken) return
    try {
      const { data } = await api.get<User>('/users/me')
      set({ user: data })
    } catch {
      // token expired or invalid -- will be handled by api interceptor
    }
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
