import { create } from 'zustand'
import api from '../services/api.service'
import type { Chat, Message } from '../types'

interface ChatState {
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  loading: boolean
  messagesLoading: boolean
  hasMoreMessages: boolean
  typingUsers: Record<string, string[]>
  replyToMessage: Message | null
  editingMessage: Message | null

  fetchChats: (companyId?: string) => Promise<void>
  fetchMessages: (chatId: string, page?: number) => Promise<void>
  setActiveChat: (chat: Chat) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void
  createDM: (targetUserId: string) => Promise<Chat>
  sendMessage: (chatId: string, content: string, type?: string, extra?: { fileUrl?: string; metadata?: Record<string, unknown> }) => Promise<void>
  setReplyTo: (message: Message | null) => void
  setEditing: (message: Message | null) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  hasMoreMessages: true,
  typingUsers: {},
  replyToMessage: null,
  editingMessage: null,

  fetchChats: async (companyId?: string) => {
    set({ loading: true })
    try {
      const params = companyId ? { companyId } : {}
      const { data } = await api.get<Chat[]>('/chats', { params })
      set({ chats: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchMessages: async (chatId: string, page = 1) => {
    set({ messagesLoading: true })
    try {
      const { data } = await api.get<Message[]>(`/chats/${chatId}/messages`, {
        params: { page, limit: 30 },
      })
      if (page === 1) {
        set({ messages: data, messagesLoading: false, hasMoreMessages: data.length === 30 })
      } else {
        set((state) => ({
          messages: [...data, ...state.messages],
          messagesLoading: false,
          hasMoreMessages: data.length === 30,
        }))
      }
    } catch {
      set({ messagesLoading: false })
    }
  },

  setActiveChat: (chat: Chat) => {
    set({ activeChat: chat, messages: [], hasMoreMessages: true })
  },

  addMessage: (message: Message) =>
    set((state) => {
      const messages = [...state.messages, message]
      const chats = state.chats.map((c) =>
        c.id === message.chatId
          ? { ...c, lastMessage: message }
          : c,
      )
      return { messages, chats }
    }),

  updateMessage: (messageId: string, updates: Partial<Message>) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m,
      ),
    })),

  removeMessage: (messageId: string) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),

  setTyping: (chatId: string, userId: string, isTyping: boolean) =>
    set((state) => {
      const current = state.typingUsers[chatId] ?? []
      const next = isTyping
        ? current.includes(userId) ? current : [...current, userId]
        : current.filter((id) => id !== userId)
      return { typingUsers: { ...state.typingUsers, [chatId]: next } }
    }),

  createDM: async (targetUserId: string) => {
    const { data } = await api.post<Chat>('/chats/dm', { targetUserId })
    set((state) => {
      const exists = state.chats.some((c) => c.id === data.id)
      return exists ? state : { chats: [data, ...state.chats] }
    })
    return data
  },

  sendMessage: async (chatId: string, content: string, type = 'text', extra?: { fileUrl?: string; metadata?: Record<string, unknown> }) => {
    const { data } = await api.post<Message>(`/chats/${chatId}/messages`, {
      content,
      type,
      fileUrl: extra?.fileUrl,
      metadata: extra?.metadata,
    })
    get().addMessage(data)
  },

  setReplyTo: (message) => set({ replyToMessage: message, editingMessage: null }),
  setEditing: (message) => set({ editingMessage: message, replyToMessage: null }),
}))
