import { create } from 'zustand'
import api from '../services/api.service'

export interface DeviceSession {
  id: string
  name: string
  deviceType: 'desktop' | 'tablet' | 'mobile'
  app: string
  location: string
  lastActive: string
  isCurrent: boolean
}

interface DeviceState {
  currentDevice: DeviceSession | null
  otherSessions: DeviceSession[]
  loading: boolean
  fetchSessions: () => Promise<void>
  terminateSession: (sessionId: string) => Promise<void>
  terminateAllOther: () => Promise<void>
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  currentDevice: null,
  otherSessions: [],
  loading: false,

  fetchSessions: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<DeviceSession[]>('/users/me/sessions')
      const current = data.find((s) => s.isCurrent) ?? null
      const others = data.filter((s) => !s.isCurrent)
      set({ currentDevice: current, otherSessions: others, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  terminateSession: async (sessionId: string) => {
    const prev = get().otherSessions
    set({ otherSessions: prev.filter((s) => s.id !== sessionId) })
    try {
      await api.delete(`/users/me/sessions/${sessionId}`)
    } catch {
      set({ otherSessions: prev })
    }
  },

  terminateAllOther: async () => {
    const prev = get().otherSessions
    set({ otherSessions: [] })
    try {
      await api.delete('/users/me/sessions')
    } catch {
      set({ otherSessions: prev })
    }
  },
}))
