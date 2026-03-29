import { create } from 'zustand'
import api from '../services/api.service'
import type { ImageGeneration } from '../types'

interface GenerateImageDto {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  cfgScale?: number
  seed?: number
  provider?: 'bedrock' | 'gemini'
}

interface ImageGenState {
  generations: ImageGeneration[]
  currentImage: string | null
  generating: boolean
  loading: boolean
  generateImage: (companyId: string, dto: GenerateImageDto) => Promise<void>
  removeBackground: (companyId: string, imageBase64: string) => Promise<void>
  fetchHistory: (companyId: string) => Promise<void>
}

export const useImageGenStore = create<ImageGenState>((set) => ({
  generations: [],
  currentImage: null,
  generating: false,
  loading: false,

  generateImage: async (companyId, dto) => {
    set({ generating: true, currentImage: null })
    try {
      const { data } = await api.post<{ imageUrl: string; generation: ImageGeneration }>(
        `/companies/${companyId}/image-gen/generate`,
        dto,
      )
      set((s) => ({
        currentImage: data.imageUrl,
        generations: [data.generation, ...s.generations],
        generating: false,
      }))
    } catch {
      set({ generating: false })
    }
  },

  removeBackground: async (companyId, imageBase64) => {
    set({ generating: true, currentImage: null })
    try {
      const { data } = await api.post<{ imageUrl: string; generation: ImageGeneration }>(
        `/companies/${companyId}/image-gen/background-remove`,
        { image: imageBase64 },
      )
      set((s) => ({
        currentImage: data.imageUrl,
        generations: [data.generation, ...s.generations],
        generating: false,
      }))
    } catch {
      set({ generating: false })
    }
  },

  fetchHistory: async (companyId) => {
    set({ loading: true })
    try {
      const { data } = await api.get<ImageGeneration[]>(
        `/companies/${companyId}/image-gen/history`,
      )
      set({ generations: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
