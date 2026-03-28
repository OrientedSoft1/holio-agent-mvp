import { create } from 'zustand'
import api from '../services/api.service'
import type { User } from '../types'

export interface Contact {
  id: string
  userId: string
  contactUserId: string
  contactUser: User
  nickname: string | null
  isBlocked: boolean
  isFavorite: boolean
  createdAt: string
}

interface ContactsState {
  contacts: Contact[]
  blocked: Contact[]
  loading: boolean
  search: string

  fetchContacts: (search?: string) => Promise<void>
  fetchBlocked: () => Promise<void>
  addContact: (contactUserId: string, nickname?: string) => Promise<Contact>
  removeContact: (contactId: string) => Promise<void>
  toggleFavorite: (contactId: string, isFavorite: boolean) => Promise<void>
  blockUser: (userId: string) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  setSearch: (search: string) => void
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  blocked: [],
  loading: false,
  search: '',

  fetchContacts: async (search?: string) => {
    set({ loading: true })
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      const { data } = await api.get<{ data: Contact[] }>('/contacts', { params })
      set({ contacts: data.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchBlocked: async () => {
    try {
      const { data } = await api.get<Contact[]>('/contacts/blocked')
      set({ blocked: data })
    } catch {
      // ignore
    }
  },

  addContact: async (contactUserId: string, nickname?: string) => {
    const { data } = await api.post<Contact>('/contacts', { contactUserId, nickname })
    set((s) => ({ contacts: [data, ...s.contacts] }))
    return data
  },

  removeContact: async (contactId: string) => {
    await api.delete(`/contacts/${contactId}`)
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== contactId) }))
  },

  toggleFavorite: async (contactId: string, isFavorite: boolean) => {
    const { data } = await api.patch<Contact>(`/contacts/${contactId}`, { isFavorite })
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === contactId ? data : c)),
    }))
  },

  blockUser: async (userId: string) => {
    await api.post(`/contacts/block/${userId}`)
    set((s) => ({
      contacts: s.contacts.filter((c) => c.contactUserId !== userId),
    }))
    get().fetchBlocked()
  },

  unblockUser: async (userId: string) => {
    await api.post(`/contacts/unblock/${userId}`)
    set((s) => ({
      blocked: s.blocked.filter((c) => c.contactUserId !== userId),
    }))
  },

  setSearch: (search: string) => set({ search }),
}))
