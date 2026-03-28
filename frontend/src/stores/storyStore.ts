import { create } from 'zustand'
import api from '../services/api.service'
import type { StoryGroup } from '../types'

interface StoryState {
  storyGroups: StoryGroup[]
  loading: boolean
  activeGroupIndex: number
  activeStoryIndex: number
  viewerOpen: boolean

  fetchStories: () => Promise<void>
  viewStory: (storyId: string) => Promise<void>
  createStory: (data: { mediaUrl: string; mediaType: string; caption?: string }) => Promise<void>
  openViewer: (groupIndex: number, storyIndex?: number) => void
  closeViewer: () => void
  nextStory: () => void
  prevStory: () => void
}

export const useStoryStore = create<StoryState>((set, get) => ({
  storyGroups: [],
  loading: false,
  activeGroupIndex: 0,
  activeStoryIndex: 0,
  viewerOpen: false,

  fetchStories: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<StoryGroup[]>('/stories')
      set({ storyGroups: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  viewStory: async (storyId: string) => {
    try {
      await api.post(`/stories/${storyId}/view`)
      set((state) => ({
        storyGroups: state.storyGroups.map((group) => ({
          ...group,
          stories: group.stories.map((s) =>
            s.id === storyId ? { ...s, viewed: true } : s,
          ),
        })),
      }))
    } catch { /* ignore */ }
  },

  createStory: async (data) => {
    await api.post('/stories', data)
    get().fetchStories()
  },

  openViewer: (groupIndex, storyIndex = 0) => {
    set({ viewerOpen: true, activeGroupIndex: groupIndex, activeStoryIndex: storyIndex })
  },

  closeViewer: () => {
    set({ viewerOpen: false })
  },

  nextStory: () => {
    const { activeGroupIndex, activeStoryIndex, storyGroups } = get()
    const currentGroup = storyGroups[activeGroupIndex]
    if (!currentGroup) return

    if (activeStoryIndex < currentGroup.stories.length - 1) {
      set({ activeStoryIndex: activeStoryIndex + 1 })
    } else if (activeGroupIndex < storyGroups.length - 1) {
      set({ activeGroupIndex: activeGroupIndex + 1, activeStoryIndex: 0 })
    } else {
      set({ viewerOpen: false })
    }
  },

  prevStory: () => {
    const { activeGroupIndex, activeStoryIndex, storyGroups } = get()
    if (activeStoryIndex > 0) {
      set({ activeStoryIndex: activeStoryIndex - 1 })
    } else if (activeGroupIndex > 0) {
      const prevGroup = storyGroups[activeGroupIndex - 1]
      set({
        activeGroupIndex: activeGroupIndex - 1,
        activeStoryIndex: prevGroup.stories.length - 1,
      })
    }
  },
}))
