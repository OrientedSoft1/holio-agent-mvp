import { create } from 'zustand'
import api from '../services/api.service'

export interface Integration {
  id: string
  name: string
  description: string
  category: 'AI & Models' | 'Automation' | 'Developer'
  icon: string
  connected: boolean
  configurable: boolean
}

interface IntegrationState {
  integrations: Integration[]
  loading: boolean
  fetchIntegrations: (companyId: string) => Promise<void>
  toggleConnection: (companyId: string, integrationId: string) => Promise<void>
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: [],
  loading: false,

  fetchIntegrations: async (companyId: string) => {
    set({ loading: true })
    try {
      const { data } = await api.get<Integration[]>(`/companies/${companyId}/integrations`)
      set({ integrations: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  toggleConnection: async (companyId: string, integrationId: string) => {
    const prev = get().integrations
    const integration = prev.find((i) => i.id === integrationId)
    if (!integration) return
    set({
      integrations: prev.map((i) =>
        i.id === integrationId ? { ...i, connected: !i.connected } : i,
      ),
    })
    try {
      await api.patch(`/companies/${companyId}/integrations/${integrationId}`, {
        isConnected: !integration.connected,
      })
    } catch {
      set({ integrations: prev })
    }
  },
}))
