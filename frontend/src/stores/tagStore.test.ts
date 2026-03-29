import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../services/api.service', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { useTagStore } from './tagStore'
import api from '../services/api.service'

describe('tagStore', () => {
  beforeEach(() => {
    useTagStore.setState({ tags: [], tagMessages: [], loading: false, messagesLoading: false })
    vi.clearAllMocks()
  })

  it('should start with empty tags', () => {
    const state = useTagStore.getState()
    expect(state.tags).toEqual([])
    expect(state.loading).toBe(false)
  })

  it('should fetch tags from API', async () => {
    const apiTags = [
      { id: 't1', emoji: '🔥', name: 'Hot', createdAt: '2025-01-01' },
      { id: 't2', emoji: '📌', name: 'Pin', createdAt: '2025-01-02' },
    ]
    vi.mocked(api.get).mockResolvedValue({ data: apiTags })
    await useTagStore.getState().fetchTags()
    expect(useTagStore.getState().tags).toEqual(apiTags)
    expect(useTagStore.getState().loading).toBe(false)
  })

  it('should set loading true while fetching tags', async () => {
    let resolvePromise: (v: unknown) => void
    const pending = new Promise((resolve) => { resolvePromise = resolve })
    vi.mocked(api.get).mockReturnValue(pending as never)

    const fetchPromise = useTagStore.getState().fetchTags()
    expect(useTagStore.getState().loading).toBe(true)

    resolvePromise!({ data: [] })
    await fetchPromise
    expect(useTagStore.getState().loading).toBe(false)
  })

  it('should handle fetch error gracefully', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    await useTagStore.getState().fetchTags()
    expect(useTagStore.getState().tags).toEqual([])
    expect(useTagStore.getState().loading).toBe(false)
  })

  it('should create a tag and append to list', async () => {
    const newTag = { id: 't3', emoji: '⭐', name: 'Star', createdAt: '2025-03-01' }
    vi.mocked(api.post).mockResolvedValue({ data: newTag })
    const result = await useTagStore.getState().createTag('⭐', 'Star')
    expect(result).toEqual(newTag)
    expect(useTagStore.getState().tags).toContainEqual(newTag)
  })

  it('should update an existing tag', async () => {
    useTagStore.setState({
      tags: [{ id: 't1', emoji: '📌', name: 'Pin', createdAt: '2025-01-01' }],
    })
    const updated = { id: 't1', emoji: '📍', name: 'Pin Updated', createdAt: '2025-01-01' }
    vi.mocked(api.patch).mockResolvedValue({ data: updated })
    await useTagStore.getState().updateTag('t1', { emoji: '📍', name: 'Pin Updated' })
    expect(useTagStore.getState().tags[0]).toEqual(updated)
  })

  it('should delete a tag after API succeeds', async () => {
    useTagStore.setState({
      tags: [
        { id: 't1', emoji: '📌', name: 'Pin', createdAt: '2025-01-01' },
        { id: 't2', emoji: '🔥', name: 'Hot', createdAt: '2025-01-02' },
      ],
    })
    vi.mocked(api.delete).mockResolvedValue({})
    await useTagStore.getState().deleteTag('t1')
    expect(useTagStore.getState().tags).toHaveLength(1)
    expect(useTagStore.getState().tags[0].id).toBe('t2')
  })

  it('should not remove tag from state if delete API fails', async () => {
    useTagStore.setState({
      tags: [{ id: 't1', emoji: '📌', name: 'Pin', createdAt: '2025-01-01' }],
    })
    vi.mocked(api.delete).mockRejectedValue(new Error('Forbidden'))
    await expect(useTagStore.getState().deleteTag('t1')).rejects.toThrow('Forbidden')
    expect(useTagStore.getState().tags).toHaveLength(1)
  })

  it('should fetch messages for a tag', async () => {
    const messages = [{ id: 'm1', content: 'Hello' }, { id: 'm2', content: 'World' }]
    vi.mocked(api.get).mockResolvedValue({ data: messages })
    await useTagStore.getState().fetchTagMessages('t1')
    expect(useTagStore.getState().tagMessages).toEqual(messages)
    expect(useTagStore.getState().messagesLoading).toBe(false)
  })
})
