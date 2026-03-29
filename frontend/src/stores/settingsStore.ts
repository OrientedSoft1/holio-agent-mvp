import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api.service'

interface NotificationPrefs {
  msgAlert: boolean
  msgPreview: boolean
  msgSound: string
  grpAlert: boolean
  grpPreview: boolean
  grpSound: string
  inAppSounds: boolean
  inAppVibrate: boolean
  inAppPreview: boolean
  contactJoined: boolean
  pinnedMessages: boolean
}

interface ChatAppearancePrefs {
  bgColor: string
  textSize: number
  sendByEnter: boolean
  raiseToListen: boolean
}

interface DataStoragePrefs {
  mobileData: boolean
  wifi: boolean
  roaming: boolean
  quality: 'auto' | 'best' | 'saver'
}

interface StorageUsage {
  usedBytes: number
  totalBytes: number
}

interface NetworkStats {
  sentBytes: number
  receivedBytes: number
}

interface SettingsState {
  notifications: NotificationPrefs
  chatAppearance: ChatAppearancePrefs
  dataStorage: DataStoragePrefs
  storageUsage: StorageUsage | null
  networkStats: NetworkStats | null
  loading: boolean

  fetchNotificationSettings: () => Promise<void>
  updateNotificationSettings: (updates: Partial<NotificationPrefs>) => Promise<void>
  fetchChatAppearance: () => Promise<void>
  updateChatAppearance: (updates: Partial<ChatAppearancePrefs>) => Promise<void>
  fetchDataStoragePrefs: () => Promise<void>
  updateDataStoragePrefs: (updates: Partial<DataStoragePrefs>) => Promise<void>
  fetchStorageUsage: () => Promise<void>
  fetchNetworkStats: () => Promise<void>
  resetNetworkStats: () => Promise<void>
  clearCache: () => Promise<void>
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  msgAlert: true,
  msgPreview: true,
  msgSound: 'Default',
  grpAlert: true,
  grpPreview: true,
  grpSound: 'Default',
  inAppSounds: true,
  inAppVibrate: true,
  inAppPreview: true,
  contactJoined: true,
  pinnedMessages: true,
}

const DEFAULT_CHAT_APPEARANCE: ChatAppearancePrefs = {
  bgColor: 'white',
  textSize: 14,
  sendByEnter: true,
  raiseToListen: false,
}

const DEFAULT_DATA_STORAGE: DataStoragePrefs = {
  mobileData: true,
  wifi: true,
  roaming: false,
  quality: 'auto',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      chatAppearance: DEFAULT_CHAT_APPEARANCE,
      dataStorage: DEFAULT_DATA_STORAGE,
      storageUsage: null,
      networkStats: null,
      loading: false,

      fetchNotificationSettings: async () => {
        try {
          const { data } = await api.get<NotificationPrefs>('/users/me/notification-settings')
          set({ notifications: { ...DEFAULT_NOTIFICATIONS, ...data } })
        } catch {
          // keep local state
        }
      },

      updateNotificationSettings: async (updates) => {
        const merged = { ...get().notifications, ...updates }
        set({ notifications: merged })
        try {
          await api.patch('/users/me/notification-settings', updates)
        } catch {
          // rollback silently handled by next fetch
        }
      },

      fetchChatAppearance: async () => {
        try {
          const { data } = await api.get<ChatAppearancePrefs>('/users/me/chat-appearance')
          set({ chatAppearance: { ...DEFAULT_CHAT_APPEARANCE, ...data } })
        } catch {
          // keep local state
        }
      },

      updateChatAppearance: async (updates) => {
        const merged = { ...get().chatAppearance, ...updates }
        set({ chatAppearance: merged })
        try {
          await api.patch('/users/me/chat-appearance', updates)
        } catch {
          // keep local
        }
      },

      fetchDataStoragePrefs: async () => {
        try {
          const { data } = await api.get<DataStoragePrefs>('/users/me/data-storage')
          set({ dataStorage: { ...DEFAULT_DATA_STORAGE, ...data } })
        } catch {
          // keep local state
        }
      },

      updateDataStoragePrefs: async (updates) => {
        const merged = { ...get().dataStorage, ...updates }
        set({ dataStorage: merged })
        try {
          await api.patch('/users/me/data-storage', updates)
        } catch {
          // keep local
        }
      },

      fetchStorageUsage: async () => {
        try {
          const { data } = await api.get<StorageUsage>('/users/me/storage-usage')
          set({ storageUsage: data })
        } catch {
          // ignore
        }
      },

      fetchNetworkStats: async () => {
        try {
          const { data } = await api.get<NetworkStats>('/users/me/network-stats')
          set({ networkStats: data })
        } catch {
          // ignore
        }
      },

      resetNetworkStats: async () => {
        try {
          await api.post('/users/me/network-stats/reset')
          set({ networkStats: { sentBytes: 0, receivedBytes: 0 } })
        } catch {
          // ignore
        }
      },

      clearCache: async () => {
        try {
          await api.post('/users/me/clear-cache')
          get().fetchStorageUsage()
        } catch {
          // ignore
        }
      },
    }),
    { name: 'holio-settings' },
  ),
)
