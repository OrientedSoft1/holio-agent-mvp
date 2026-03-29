import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../services/api.service', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

import { useSettingsStore } from './settingsStore'
import api from '../services/api.service'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      notifications: {
        msgAlert: true, msgPreview: true, msgSound: 'Default',
        grpAlert: true, grpPreview: true, grpSound: 'Default',
        inAppSounds: true, inAppVibrate: true, inAppPreview: true,
        contactJoined: true, pinnedMessages: true,
      },
      chatAppearance: { bgColor: 'white', textSize: 14, sendByEnter: true, raiseToListen: false },
      dataStorage: { mobileData: true, wifi: true, roaming: false, quality: 'auto' },
      storageUsage: null,
      networkStats: null,
      loading: false,
    })
    vi.clearAllMocks()
  })

  it('should have default notification settings', () => {
    const state = useSettingsStore.getState()
    expect(state.notifications.msgAlert).toBe(true)
    expect(state.notifications.msgSound).toBe('Default')
  })

  it('should update notification settings optimistically', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    const { updateNotificationSettings } = useSettingsStore.getState()
    await updateNotificationSettings({ msgAlert: false })
    expect(useSettingsStore.getState().notifications.msgAlert).toBe(false)
  })

  it('should keep optimistic update even when API fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('Network error'))
    const { updateNotificationSettings } = useSettingsStore.getState()
    await updateNotificationSettings({ msgAlert: false })
    expect(useSettingsStore.getState().notifications.msgAlert).toBe(false)
  })

  it('should have default chat appearance', () => {
    const state = useSettingsStore.getState()
    expect(state.chatAppearance.bgColor).toBe('white')
    expect(state.chatAppearance.textSize).toBe(14)
    expect(state.chatAppearance.sendByEnter).toBe(true)
  })

  it('should update chat appearance optimistically', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    const { updateChatAppearance } = useSettingsStore.getState()
    await updateChatAppearance({ textSize: 18 })
    expect(useSettingsStore.getState().chatAppearance.textSize).toBe(18)
  })

  it('should have default data storage prefs', () => {
    const state = useSettingsStore.getState()
    expect(state.dataStorage.mobileData).toBe(true)
    expect(state.dataStorage.roaming).toBe(false)
    expect(state.dataStorage.quality).toBe('auto')
  })

  it('should update data storage prefs optimistically', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    const { updateDataStoragePrefs } = useSettingsStore.getState()
    await updateDataStoragePrefs({ roaming: true, quality: 'saver' })
    const state = useSettingsStore.getState()
    expect(state.dataStorage.roaming).toBe(true)
    expect(state.dataStorage.quality).toBe('saver')
  })

  it('should fetch notification settings from API', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { msgAlert: false, msgSound: 'Chime' },
    })
    await useSettingsStore.getState().fetchNotificationSettings()
    const state = useSettingsStore.getState()
    expect(state.notifications.msgAlert).toBe(false)
    expect(state.notifications.msgSound).toBe('Chime')
    expect(state.notifications.grpAlert).toBe(true)
  })

  it('should keep local notifications when fetch fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Offline'))
    await useSettingsStore.getState().fetchNotificationSettings()
    expect(useSettingsStore.getState().notifications.msgAlert).toBe(true)
  })

  it('should reset network stats', async () => {
    useSettingsStore.setState({ networkStats: { sentBytes: 5000, receivedBytes: 8000 } })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await useSettingsStore.getState().resetNetworkStats()
    const stats = useSettingsStore.getState().networkStats
    expect(stats?.sentBytes).toBe(0)
    expect(stats?.receivedBytes).toBe(0)
  })
})
