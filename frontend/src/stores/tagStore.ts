import { create } from 'zustand'
import api from '../services/api.service'
import type { Tag, TaggedMessage } from '../types'

const DEFAULT_TAGS: Tag[] = [
  { id: 'default-1', name: 'Design idea', emoji: '🎨', color: 'lavender', createdAt: new Date().toISOString() },
  { id: 'default-2', name: 'Useful site', emoji: '🔗', color: 'sage', createdAt: new Date().toISOString() },
  { id: 'default-3', name: 'Mockups', emoji: '📐', color: 'lavender', createdAt: new Date().toISOString() },
  { id: 'default-4', name: 'Important', emoji: '⭐', color: 'sage', createdAt: new Date().toISOString() },
  { id: 'default-5', name: 'To read', emoji: '📖', color: 'lavender', createdAt: new Date().toISOString() },
]

interface TagState {
  tags: Tag[]
  messageTagMap: Record<string, string[]>
  taggedMessages: Record<string, TaggedMessage[]>
  activeTagId: string | null
  loading: boolean

  fetchTags: () => Promise<void>
  createTag: (name: string, emoji: string) => Promise<Tag>
  toggleMessageTag: (messageId: string, tagId: string) => Promise<void>
  fetchTaggedMessages: (tagId: string) => Promise<void>
  setActiveTag: (tagId: string | null) => void
  getMessageTags: (messageId: string) => Tag[]
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: DEFAULT_TAGS,
  messageTagMap: {},
  taggedMessages: {},
  activeTagId: null,
  loading: false,

  fetchTags: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<Tag[]>('/tags')
      set({ tags: data.length > 0 ? data : DEFAULT_TAGS, loading: false })
    } catch {
      set({ tags: DEFAULT_TAGS, loading: false })
    }
  },

  createTag: async (name: string, emoji: string) => {
    const colors: Tag['color'][] = ['lavender', 'sage']
    const color = colors[get().tags.length % 2]
    try {
      const { data } = await api.post<Tag>('/tags', { name, emoji, color })
      set((s) => ({ tags: [...s.tags, data] }))
      return data
    } catch {
      const localTag: Tag = {
        id: `local-${Date.now()}`,
        name,
        emoji,
        color,
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ tags: [...s.tags, localTag] }))
      return localTag
    }
  },

  toggleMessageTag: async (messageId: string, tagId: string) => {
    const current = get().messageTagMap[messageId] ?? []
    const isTagged = current.includes(tagId)
    const next = isTagged ? current.filter((id) => id !== tagId) : [...current, tagId]

    set((s) => ({
      messageTagMap: { ...s.messageTagMap, [messageId]: next },
    }))

    try {
      if (isTagged) {
        await api.delete(`/messages/${messageId}/tags/${tagId}`)
      } else {
        await api.post(`/messages/${messageId}/tags`, { tagId })
      }
    } catch {
      set((s) => ({
        messageTagMap: { ...s.messageTagMap, [messageId]: current },
      }))
    }
  },

  fetchTaggedMessages: async (tagId: string) => {
    set({ loading: true })
    try {
      const { data } = await api.get<TaggedMessage[]>(`/tags/${tagId}/messages`)
      set((s) => ({ taggedMessages: { ...s.taggedMessages, [tagId]: data }, loading: false }))
    } catch {
      set({ loading: false })
    }
  },

  setActiveTag: (tagId) => set({ activeTagId: tagId }),

  getMessageTags: (messageId: string) => {
    const tagIds = get().messageTagMap[messageId] ?? []
    return get().tags.filter((t) => tagIds.includes(t.id))
  },
}))
