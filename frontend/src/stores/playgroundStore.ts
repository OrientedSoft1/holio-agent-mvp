import { create } from 'zustand'
import api from '../services/api.service'
import type { PlaygroundPreset, PlaygroundMessage } from '../types'

interface PlaygroundState {
  messages: PlaygroundMessage[]
  presets: PlaygroundPreset[]
  selectedModel: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  streaming: boolean
  loading: boolean
  addMessage: (msg: PlaygroundMessage) => void
  clearChat: () => void
  setSelectedModel: (model: string) => void
  setTemperature: (val: number) => void
  setMaxTokens: (val: number) => void
  setSystemPrompt: (val: string) => void
  sendMessage: (companyId: string, content: string) => Promise<void>
  fetchPresets: (companyId: string) => Promise<void>
  savePreset: (companyId: string, name: string) => Promise<void>
  deletePreset: (companyId: string, presetId: string) => Promise<void>
  loadPreset: (preset: PlaygroundPreset) => void
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  messages: [],
  presets: [],
  selectedModel: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful assistant.',
  streaming: false,
  loading: false,

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearChat: () => set({ messages: [] }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setTemperature: (val) => set({ temperature: val }),
  setMaxTokens: (val) => set({ maxTokens: val }),
  setSystemPrompt: (val) => set({ systemPrompt: val }),

  sendMessage: async (companyId, content) => {
    const state = get()
    const userMsg: PlaygroundMessage = { role: 'user', content }
    set((s) => ({ messages: [...s.messages, userMsg], streaming: true }))

    const startTime = Date.now()
    try {
      const { data } = await api.post<{ content: string; tokensUsed: number }>(
        `/companies/${companyId}/playground/invoke`,
        {
          systemPrompt: state.systemPrompt,
          messages: [...state.messages, userMsg],
          modelId: state.selectedModel,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
        },
      )
      const latencyMs = Date.now() - startTime
      const assistantMsg: PlaygroundMessage = {
        role: 'assistant',
        content: data.content,
        tokensUsed: data.tokensUsed || undefined,
        latencyMs,
      }
      set((s) => ({ messages: [...s.messages, assistantMsg], streaming: false }))
    } catch {
      set({ streaming: false })
    }
  },

  fetchPresets: async (companyId) => {
    try {
      const { data } = await api.get<PlaygroundPreset[]>(
        `/companies/${companyId}/playground/presets`,
      )
      set({ presets: data })
    } catch {
      // keep existing
    }
  },

  savePreset: async (companyId, name) => {
    const state = get()
    try {
      const { data } = await api.post<PlaygroundPreset>(
        `/companies/${companyId}/playground/presets`,
        {
          name,
          systemPrompt: state.systemPrompt,
          modelId: state.selectedModel,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
        },
      )
      set((s) => ({ presets: [...s.presets, data] }))
    } catch {
      // silent
    }
  },

  deletePreset: async (companyId, presetId) => {
    try {
      await api.delete(`/companies/${companyId}/playground/presets/${presetId}`)
      set((s) => ({ presets: s.presets.filter((p) => p.id !== presetId) }))
    } catch {
      // silent
    }
  },

  loadPreset: (preset) =>
    set({
      selectedModel: preset.modelId,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens,
      systemPrompt: preset.systemPrompt,
    }),
}))
