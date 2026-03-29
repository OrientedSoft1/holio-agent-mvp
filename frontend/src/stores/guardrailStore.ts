import { create } from 'zustand'
import api from '../services/api.service'
import type { Guardrail, GuardrailDetail, GuardrailTestResult } from '../types'

interface CreateGuardrailDto {
  name: string
  description?: string
  blockedInputMessaging?: string
  blockedOutputsMessaging?: string
  contentFilters?: { type: string; inputStrength: string; outputStrength: string }[]
  deniedTopics?: { name: string; definition: string }[]
  wordFilters?: string[]
  sensitiveInfoTypes?: { type: string; action: string }[]
}

interface GuardrailState {
  guardrails: Guardrail[]
  selectedGuardrail: GuardrailDetail | null
  loading: boolean
  fetchGuardrails: (companyId: string) => Promise<void>
  fetchGuardrailDetail: (companyId: string, guardrailId: string) => Promise<void>
  createGuardrail: (companyId: string, dto: CreateGuardrailDto) => Promise<void>
  deleteGuardrail: (companyId: string, guardrailId: string) => Promise<void>
  testGuardrail: (companyId: string, guardrailId: string, content: string, source: 'INPUT' | 'OUTPUT') => Promise<GuardrailTestResult>
}

export const useGuardrailStore = create<GuardrailState>((set) => ({
  guardrails: [],
  selectedGuardrail: null,
  loading: false,

  fetchGuardrails: async (companyId) => {
    set({ loading: true })
    try {
      const { data } = await api.get<Guardrail[]>(
        `/companies/${companyId}/guardrails`,
      )
      set({ guardrails: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchGuardrailDetail: async (companyId, guardrailId) => {
    try {
      const { data } = await api.get<GuardrailDetail>(
        `/companies/${companyId}/guardrails/${guardrailId}`,
      )
      set({ selectedGuardrail: data })
    } catch {
      // silent
    }
  },

  createGuardrail: async (companyId, dto) => {
    const { data } = await api.post<Guardrail>(
      `/companies/${companyId}/guardrails`,
      dto,
    )
    set((s) => ({ guardrails: [...s.guardrails, data] }))
  },

  deleteGuardrail: async (companyId, guardrailId) => {
    await api.delete(`/companies/${companyId}/guardrails/${guardrailId}`)
    set((s) => ({
      guardrails: s.guardrails.filter((g) => g.guardrailId !== guardrailId),
    }))
  },

  testGuardrail: async (companyId, guardrailId, content, source) => {
    const { data } = await api.post<GuardrailTestResult>(
      `/companies/${companyId}/guardrails/${guardrailId}/test`,
      { content, source },
    )
    return data
  },
}))
