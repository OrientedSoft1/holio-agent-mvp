import { create } from 'zustand'

interface PresenceState {
  onlineUsers: Set<string>
  lastSeen: Record<string, string>
  setOnline: (userId: string) => void
  setOffline: (userId: string, lastSeenAt?: string) => void
  updatePresence: (userId: string, isOnline: boolean, lastSeenAt?: string) => void
  isUserOnline: (userId: string) => boolean
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set(),
  lastSeen: {},

  setOnline: (userId: string) =>
    set((state) => {
      const next = new Set(state.onlineUsers)
      next.add(userId)
      return { onlineUsers: next }
    }),

  setOffline: (userId: string, lastSeenAt?: string) =>
    set((state) => {
      const next = new Set(state.onlineUsers)
      next.delete(userId)
      const ls = lastSeenAt
        ? { ...state.lastSeen, [userId]: lastSeenAt }
        : state.lastSeen
      return { onlineUsers: next, lastSeen: ls }
    }),

  updatePresence: (userId: string, isOnline: boolean, lastSeenAt?: string) => {
    if (isOnline) {
      get().setOnline(userId)
    } else {
      get().setOffline(userId, lastSeenAt)
    }
  },

  isUserOnline: (userId: string) => get().onlineUsers.has(userId),
}))
