import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chat } from '../types'

export interface Folder {
  id: string
  name: string
  icon?: string
  filters: {
    contacts?: boolean
    nonContacts?: boolean
    groups?: boolean
    channels?: boolean
    bots?: boolean
  }
  chatIds?: string[]
}

interface FolderState {
  folders: Folder[]
  activeFolder: string
  setActiveFolder: (id: string) => void
  addFolder: (folder: Folder) => void
  removeFolder: (id: string) => void
  filterChats: (chats: Chat[]) => Chat[]
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Chats', filters: {} },
  { id: 'personal', name: 'Personal', filters: { contacts: true } },
  { id: 'work', name: 'Work', filters: { channels: true, groups: true } },
  { id: 'bots', name: 'Bots', filters: { bots: true } },
]

export const useFolderStore = create<FolderState>()(
  persist(
    (set, get) => ({
      folders: DEFAULT_FOLDERS,
      activeFolder: 'all',

      setActiveFolder: (id: string) => set({ activeFolder: id }),

      addFolder: (folder: Folder) =>
        set((state) => ({ folders: [...state.folders, folder] })),

      removeFolder: (id: string) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          activeFolder: state.activeFolder === id ? 'all' : state.activeFolder,
        })),

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
