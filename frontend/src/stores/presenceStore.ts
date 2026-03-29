import { create } from 'zustand'

interface PresenceState {
  onlineUsers: Record<string, true>
  lastSeen: Record<string, string>
  setOnline: (userId: string) => void
  setOffline: (userId: string, lastSeenAt?: string) => void
  updatePresence: (userId: string, isOnline: boolean, lastSeenAt?: string) => void
  isUserOnline: (userId: string) => boolean
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},
  lastSeen: {},

  setOnline: (userId: string) =>
    set((state) => {
      if (state.onlineUsers[userId]) return state
      return { onlineUsers: { ...state.onlineUsers, [userId]: true } }
    }),

  setOffline: (userId: string, lastSeenAt?: string) =>
    set((state) => {
      if (!state.onlineUsers[userId]) return state
      const { [userId]: _, ...rest } = state.onlineUsers
      const ls = lastSeenAt
        ? { ...state.lastSeen, [userId]: lastSeenAt }
        : state.lastSeen
      return { onlineUsers: rest, lastSeen: ls }
    }),

  updatePresence: (userId: string, isOnline: boolean, lastSeenAt?: string) => {
    if (isOnline) {
      get().setOnline(userId)
    } else {
      get().setOffline(userId, lastSeenAt)
    }
  },

  isUserOnline: (userId: string) => !!get().onlineUsers[userId],
}))
