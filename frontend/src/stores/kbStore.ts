import { create } from 'zustand'
import api from '../services/api.service'
import type { KnowledgeBase, KBRetrievalResult, KBRagResult } from '../types'

interface CreateKBParams {
  name: string
  description?: string
  s3BucketName: string
}

interface KBState {
  knowledgeBases: KnowledgeBase[]
  loading: boolean
  fetchKnowledgeBases: (companyId: string) => Promise<void>
  createKB: (companyId: string, params: CreateKBParams) => Promise<void>
  queryKB: (companyId: string, kbId: string, query: string, maxResults?: number) => Promise<KBRetrievalResult[]>
  ragQuery: (companyId: string, kbId: string, query: string, modelId?: string) => Promise<KBRagResult>
  syncKB: (companyId: string, kbId: string) => Promise<void>
  deleteKB: (companyId: string, kbId: string) => Promise<void>
}

export const useKBStore = create<KBState>((set) => ({
  knowledgeBases: [],
  loading: false,

  fetchKnowledgeBases: async (companyId) => {
    set({ loading: true })
    try {
      const { data } = await api.get<KnowledgeBase[]>(
        `/companies/${companyId}/knowledge-bases`,
      )
      set({ knowledgeBases: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createKB: async (companyId, params) => {
    const { data } = await api.post<KnowledgeBase>(
      `/companies/${companyId}/knowledge-bases`,
      params,
    )
    set((s) => ({ knowledgeBases: [data, ...s.knowledgeBases] }))
  },

  queryKB: async (companyId, kbId, query, maxResults = 5) => {
    const { data } = await api.post<{ results: KBRetrievalResult[] }>(
      `/companies/${companyId}/knowledge-bases/${kbId}/query`,
      { query, maxResults },
    )
    return data.results
  },

  ragQuery: async (companyId, kbId, query, modelId) => {
    const { data } = await api.post<KBRagResult>(
      `/companies/${companyId}/knowledge-bases/${kbId}/rag`,
      { query, modelId },
    )
    return data
  },

  syncKB: async (companyId, kbId) => {
    await api.post(`/companies/${companyId}/knowledge-bases/${kbId}/sync`)
  },

  deleteKB: async (companyId, kbId) => {
    await api.delete(`/companies/${companyId}/knowledge-bases/${kbId}`)
    set((s) => ({
      knowledgeBases: s.knowledgeBases.filter((kb) => kb.knowledgeBaseId !== kbId),
    }))
  },
}))
