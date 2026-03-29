import { create } from 'zustand'
import api from '../services/api.service'
import type { AIUsageSummary, AIUsageDaily, AIUsageByModel, AIUsageByBot } from '../types'

interface UsageState {
  summary: AIUsageSummary | null
  dailyUsage: AIUsageDaily[]
  byModel: AIUsageByModel[]
  byBot: AIUsageByBot[]
  loading: boolean
  error: string | null
  fetchAll: (companyId: string) => Promise<void>
}

export const useUsageStore = create<UsageState>((set) => ({
  summary: null,
  dailyUsage: [],
  byModel: [],
  byBot: [],
  loading: false,
  error: null,

  fetchAll: async (companyId) => {
    set({ loading: true, error: null })
    try {
      const [summaryRes, dailyRes, modelRes, botRes] = await Promise.all([
        api.get<AIUsageSummary>(`/companies/${companyId}/ai-usage/summary`),
        api.get<AIUsageDaily[]>(`/companies/${companyId}/ai-usage/daily?days=30`),
        api.get<AIUsageByModel[]>(`/companies/${companyId}/ai-usage/by-model`),
        api.get<AIUsageByBot[]>(`/companies/${companyId}/ai-usage/by-bot`),
      ])
      set({
        summary: summaryRes.data,
        dailyUsage: dailyRes.data,
        byModel: modelRes.data,
        byBot: botRes.data,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load usage data'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },
}))
