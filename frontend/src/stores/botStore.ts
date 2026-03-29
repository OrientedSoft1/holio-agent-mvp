import { create } from 'zustand'
import api from '../services/api.service'
import type { Bot, BotTemplate, Chat } from '../types'

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
  availableModels: { modelId: string; modelName: string; provider: string }[]
  modelsFetchError: string | null
  loading: boolean
  fetchTemplates: () => Promise<void>
  fetchCompanyBots: (companyId: string) => Promise<void>
  fetchModels: (companyId: string) => Promise<void>
  createBot: (dto: CreateBotDto) => Promise<Bot>
  createFromTemplate: (companyId: string, templateId: string) => Promise<Bot>
  updateBot: (botId: string, dto: UpdateBotDto) => Promise<void>
  deleteBot: (botId: string) => Promise<void>
  inviteBotToChat: (botId: string, chatId: string) => Promise<void>
  removeBotFromChat: (botId: string, chatId: string) => Promise<void>
  startBotChat: (botId: string) => Promise<Chat>
}

export const useBotStore = create<BotState>((set) => ({
  templates: [],
  companyBots: [],
  availableModels: [],
  modelsFetchError: null,
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

  fetchModels: async (companyId: string) => {
    try {
      const { data } = await api.get<{ modelId: string; modelName: string; provider: string }[]>(
        `/companies/${companyId}/bedrock-models`,
      )
      set({ availableModels: data, modelsFetchError: null })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load models'
      set({ modelsFetchError: message })
    }
  },

  createBot: async (dto: CreateBotDto) => {
    const { data } = await api.post<Bot>(`/companies/${dto.companyId}/bots`, dto)
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
    await api.post(`/bots/${botId}/invite`, { chatId })
  },

  removeBotFromChat: async (botId: string, chatId: string) => {
    await api.delete(`/bots/${botId}/chats/${chatId}`)
  },

  startBotChat: async (botId: string) => {
    const { data } = await api.post<Chat>(`/bots/${botId}/chat`)
    return data
  },
}))
