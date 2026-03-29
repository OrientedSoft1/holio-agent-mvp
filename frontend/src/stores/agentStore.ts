import { create } from 'zustand'
import api from '../services/api.service'
import type { AgentDefinition, AgentActionGroup } from '../types'

interface CreateAgentDto {
  name: string
  description?: string
  modelId: string
  instruction: string
  actionGroups?: AgentActionGroup[]
  knowledgeBaseIds?: string[]
}

interface UpdateAgentDto {
  name?: string
  description?: string
  modelId?: string
  instruction?: string
  actionGroups?: AgentActionGroup[]
  knowledgeBaseIds?: string[]
}

interface AgentState {
  agents: AgentDefinition[]
  selectedAgent: AgentDefinition | null
  loading: boolean
  fetchAgents: (companyId: string) => Promise<void>
  createAgent: (companyId: string, dto: CreateAgentDto) => Promise<AgentDefinition>
  updateAgent: (agentId: string, dto: UpdateAgentDto) => Promise<void>
  deleteAgent: (agentId: string) => Promise<void>
  deployAgent: (agentId: string) => Promise<void>
  invokeAgent: (agentId: string, input: string, sessionId?: string) => Promise<string>
  setSelectedAgent: (agent: AgentDefinition | null) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,
  loading: false,

  fetchAgents: async (companyId) => {
    set({ loading: true })
    try {
      const { data } = await api.get<AgentDefinition[]>(
        `/companies/${companyId}/agents`,
      )
      set({ agents: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createAgent: async (companyId, dto) => {
    const { data } = await api.post<AgentDefinition>(
      `/companies/${companyId}/agents`,
      dto,
    )
    set((s) => ({ agents: [...s.agents, data] }))
    return data
  },

  updateAgent: async (agentId, dto) => {
    const { data } = await api.patch<AgentDefinition>(`/agents/${agentId}`, dto)
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agentId ? data : a)),
      selectedAgent: s.selectedAgent?.id === agentId ? data : s.selectedAgent,
    }))
  },

  deleteAgent: async (agentId) => {
    await api.delete(`/agents/${agentId}`)
    set((s) => ({
      agents: s.agents.filter((a) => a.id !== agentId),
      selectedAgent: s.selectedAgent?.id === agentId ? null : s.selectedAgent,
    }))
  },

  deployAgent: async (agentId) => {
    const { data } = await api.post<AgentDefinition>(`/agents/${agentId}/deploy`)
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agentId ? data : a)),
      selectedAgent: s.selectedAgent?.id === agentId ? data : s.selectedAgent,
    }))
  },

  invokeAgent: async (agentId, input, sessionId) => {
    const { data } = await api.post<{ response: string }>(
      `/agents/${agentId}/invoke`,
      { input, sessionId },
    )
    return data.response
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}))
