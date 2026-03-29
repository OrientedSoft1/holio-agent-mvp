import { create } from 'zustand'
import api from '../services/api.service'
import type { Message } from '../types'

export interface Tag {
  id: string
  emoji: string
  name: string
  createdAt: string
}

interface TagState {
  tags: Tag[]
  tagMessages: Message[]
  loading: boolean
  messagesLoading: boolean

  fetchTags: () => Promise<void>
  createTag: (emoji: string, name: string) => Promise<Tag>
  updateTag: (tagId: string, data: { emoji?: string; name?: string }) => Promise<void>
  deleteTag: (tagId: string) => Promise<void>
  addTagToMessage: (messageId: string, tagId: string) => Promise<void>
  removeTagFromMessage: (messageId: string, tagId: string) => Promise<void>
  fetchTagMessages: (tagId: string) => Promise<void>
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  tagMessages: [],
  loading: false,
  messagesLoading: false,

  fetchTags: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<Tag[]>('/tags')
      set({ tags: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createTag: async (emoji: string, name: string) => {
    const { data } = await api.post<Tag>('/tags', { emoji, name })
    set((state) => ({ tags: [...state.tags, data] }))
    return data
  },

  updateTag: async (tagId: string, updates: { emoji?: string; name?: string }) => {
    const { data } = await api.patch<Tag>(`/tags/${tagId}`, updates)
    set((state) => ({
      tags: state.tags.map((t) => (t.id === tagId ? data : t)),
    }))
  },

  deleteTag: async (tagId: string) => {
    await api.delete(`/tags/${tagId}`)
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== tagId),
    }))
  },

  addTagToMessage: async (messageId: string, tagId: string) => {
    await api.post(`/messages/${messageId}/tags`, { tagId })
  },

  removeTagFromMessage: async (messageId: string, tagId: string) => {
    await api.delete(`/messages/${messageId}/tags/${tagId}`)
  },

  fetchTagMessages: async (tagId: string) => {
    set({ messagesLoading: true })
    try {
      const { data } = await api.get<Message[]>(`/tags/${tagId}/messages`)
      set({ tagMessages: data, messagesLoading: false })
    } catch {
      set({ messagesLoading: false })
    }
  },
}))
