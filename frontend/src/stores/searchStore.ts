import { create } from 'zustand'
import api from '../services/api.service'
import type { SearchResults, Message } from '../types'

interface SearchState {
  query: string
  results: SearchResults | null
  loading: boolean
  recentSearches: string[]

  inChatQuery: string
  inChatResults: Message[]
  inChatTotal: number
  inChatIndex: number
  inChatLoading: boolean

  setQuery: (query: string) => void
  globalSearch: (query: string) => Promise<void>
  clearResults: () => void
  addRecentSearch: (query: string) => void

  setInChatQuery: (query: string) => void
  inChatSearch: (chatId: string, query: string, filters?: { type?: string }) => Promise<void>
  setInChatIndex: (index: number) => void
  clearInChatSearch: () => void
}

const MAX_RECENT = 10

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: null,
  loading: false,
  recentSearches: (() => { try { return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('recentSearches') ?? '[]') : [] } catch { return [] } })(),

  inChatQuery: '',
  inChatResults: [],
  inChatTotal: 0,
  inChatIndex: 0,
  inChatLoading: false,

  setQuery: (query) => set({ query }),

  globalSearch: async (query) => {
    if (!query.trim()) {
      set({ results: null })
      return
    }
    set({ loading: true })
    try {
      const { data } = await api.get<SearchResults>('/search', {
        params: { q: query },
      })
      set({ results: data, loading: false })
      get().addRecentSearch(query)
    } catch {
      set({ loading: false })
    }
  },

  clearResults: () => set({ query: '', results: null }),

  addRecentSearch: (query) => {
    const current = get().recentSearches.filter((s) => s !== query)
    const updated = [query, ...current].slice(0, MAX_RECENT)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    set({ recentSearches: updated })
  },

  setInChatQuery: (query) => set({ inChatQuery: query }),

  inChatSearch: async (chatId, query, filters) => {
    if (!query.trim()) {
      set({ inChatResults: [], inChatTotal: 0, inChatIndex: 0 })
      return
    }
    set({ inChatLoading: true })
    try {
      const { data } = await api.get<{ data: Message[]; total: number }>(
        `/chats/${chatId}/search`,
        { params: { q: query, type: filters?.type } },
      )
      set({
        inChatResults: data.data,
        inChatTotal: data.total,
        inChatIndex: 0,
        inChatLoading: false,
      })
    } catch {
      set({ inChatLoading: false })
    }
  },

  setInChatIndex: (index) => set({ inChatIndex: index }),

  clearInChatSearch: () =>
    set({ inChatQuery: '', inChatResults: [], inChatTotal: 0, inChatIndex: 0 }),
}))
