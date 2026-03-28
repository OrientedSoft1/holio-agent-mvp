import { create } from 'zustand'
import api from '../services/api.service'
import type { Bot, BotTemplate } from '../types'

interface CreateBotDto {
  companyId: string
  name: string
  description?: string
  type: Bot['type']
  systemPrompt: string
  modelId: string
  temperature: number
  maxTokens: number
}

interface UpdateBotDto {
  name?: string
  description?: string
  systemPrompt?: string
  modelId?: string
  temperature?: number
  maxTokens?: number
  isActive?: boolean
}

interface BotState {
  templates: BotTemplate[]
  companyBots: Bot[]
  loading: boolean
  fetchTemplates: () => Promise<void>
  fetchCompanyBots: (companyId: string) => Promise<void>
  createBot: (dto: CreateBotDto) => Promise<Bot>
  createFromTemplate: (companyId: string, templateId: string) => Promise<Bot>
  updateBot: (botId: string, dto: UpdateBotDto) => Promise<void>
  deleteBot: (botId: string) => Promise<void>
  inviteBotToChat: (botId: string, chatId: string) => Promise<void>
  removeBotFromChat: (botId: string, chatId: string) => Promise<void>
}

export const useBotStore = create<BotState>((set) => ({
  templates: [],
  companyBots: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<BotTemplate[]>('/bots/templates')
      set({ templates: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchCompanyBots: async (companyId: string) => {
    set({ loading: true })
    try {
      const { data } = await api.get<Bot[]>(`/companies/${companyId}/bots`)
      set({ companyBots: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createBot: async (dto: CreateBotDto) => {
    const { data } = await api.post<Bot>('/bots', dto)
    set((state) => ({ companyBots: [...state.companyBots, data] }))
    return data
  },

  createFromTemplate: async (companyId: string, templateId: string) => {
    const { data } = await api.post<Bot>(`/bots/from-template`, {
      companyId,
      templateId,
    })
    set((state) => ({ companyBots: [...state.companyBots, data] }))
    return data
  },

  updateBot: async (botId: string, dto: UpdateBotDto) => {
    const { data } = await api.patch<Bot>(`/bots/${botId}`, dto)
    set((state) => ({
      companyBots: state.companyBots.map((b) =>
        b.id === botId ? data : b,
      ),
    }))
  },

  deleteBot: async (botId: string) => {
    await api.delete(`/bots/${botId}`)
    set((state) => ({
      companyBots: state.companyBots.filter((b) => b.id !== botId),
    }))
  },

  inviteBotToChat: async (botId: string, chatId: string) => {
    await api.post(`/chats/${chatId}/bots`, { botId })
  },

  removeBotFromChat: async (botId: string, chatId: string) => {
    await api.delete(`/chats/${chatId}/bots/${botId}`)
  },
}))
