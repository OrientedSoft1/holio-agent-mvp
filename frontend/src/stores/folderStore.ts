import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api.service'
import type { Chat } from '../types'

export interface Folder {
  id: string
  name: string
  icon?: string | null
  filters: {
    contacts?: boolean
    nonContacts?: boolean
    groups?: boolean
    channels?: boolean
    bots?: boolean
  }
  chatIds?: string[]
  order?: number
  isDefault?: boolean
}

interface FolderState {
  folders: Folder[]
  activeFolder: string
  loading: boolean
  setActiveFolder: (id: string) => void
  fetchFolders: () => Promise<void>
  addFolder: (name: string, filters?: Folder['filters'], chatIds?: string[]) => Promise<void>
  updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'icon' | 'filters' | 'chatIds'>>) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  filterChats: (chats: Chat[]) => Chat[]
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Chats', filters: {}, isDefault: true },
  { id: 'personal', name: 'Personal', filters: { contacts: true }, isDefault: true },
  { id: 'work', name: 'Work', filters: { channels: true, groups: true }, isDefault: true },
  { id: 'bots', name: 'Bots', filters: { bots: true }, isDefault: true },
]

export const useFolderStore = create<FolderState>()(
  persist(
    (set, get) => ({
      folders: DEFAULT_FOLDERS,
      activeFolder: 'all',
      loading: false,

      setActiveFolder: (id: string) => set({ activeFolder: id }),

      fetchFolders: async () => {
        set({ loading: true })
        try {
          const { data } = await api.get<Folder[]>('/folders')
          const custom: Folder[] = data.map((f) => ({
            ...f,
            filters: f.filters ?? {},
            isDefault: false,
          }))
          set({ folders: [...DEFAULT_FOLDERS, ...custom] })
        } catch {
          // keep defaults on error
        } finally {
          set({ loading: false })
        }
      },

      addFolder: async (name, filters = {}, chatIds = []) => {
        try {
          const { data } = await api.post<Folder>('/folders', {
            name,
            filters,
            chatIds,
          })
          set((state) => ({
            folders: [...state.folders, { ...data, filters: data.filters ?? {}, isDefault: false }],
            activeFolder: data.id,
          }))
        } catch {
          // silent
        }
      },

      updateFolder: async (id, updates) => {
        try {
          const { data } = await api.patch<Folder>(`/folders/${id}`, updates)
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === id ? { ...f, ...data, filters: data.filters ?? f.filters, isDefault: false } : f,
            ),
          }))
        } catch {
          // silent
        }
      },

      removeFolder: async (id: string) => {
        try {
          await api.delete(`/folders/${id}`)
          set((state) => ({
            folders: state.folders.filter((f) => f.id !== id),
            activeFolder: state.activeFolder === id ? 'all' : state.activeFolder,
          }))
        } catch {
          // silent
        }
      },

      filterChats: (chats: Chat[]) => {
        const { activeFolder, folders } = get()
        if (activeFolder === 'all') return chats

        const folder = folders.find((f) => f.id === activeFolder)
        if (!folder) return chats

        return chats.filter((chat) => {
          if (folder.filters.contacts && chat.type === 'private') return true
          if (folder.filters.groups && chat.type === 'group') return true
          if (folder.filters.channels && chat.type === 'channel') return true
          if (folder.filters.bots && chat.type === 'bot') return true
          if (folder.chatIds?.includes(chat.id)) return true
          return false
        })
      },
    }),
    { name: 'holio-folders' },
  ),
)
