import { create } from 'zustand'

export type NavItem = 'all' | 'personal' | 'company' | 'channels' | 'bots' | 'favorites' | 'stories'

interface UiState {
  showInfoPanel: boolean
  showEmojiPicker: boolean
  showGlobalSearch: boolean
  showInChatSearch: boolean
  darkMode: boolean
  activeNavItem: NavItem
  chatListWidth: number
  infoPanelWidth: number
  toggleInfoPanel: () => void
  setShowInfoPanel: (show: boolean) => void
  toggleEmojiPicker: () => void
  toggleGlobalSearch: () => void
  setShowGlobalSearch: (show: boolean) => void
  toggleInChatSearch: () => void
  setShowInChatSearch: (show: boolean) => void
  toggleDarkMode: () => void
  setActiveNavItem: (item: NavItem) => void
  setChatListWidth: (width: number) => void
  setInfoPanelWidth: (width: number) => void
}

const storedDark = localStorage.getItem('holio-dark-mode') === 'true'

export const useUiStore = create<UiState>((set) => ({
  showInfoPanel: false,
  showEmojiPicker: false,
  showGlobalSearch: false,
  showInChatSearch: false,
  darkMode: storedDark,
  activeNavItem: 'all',
  chatListWidth: 320,
  infoPanelWidth: 300,
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  setShowInfoPanel: (show) => set({ showInfoPanel: show }),
  toggleEmojiPicker: () => set((s) => ({ showEmojiPicker: !s.showEmojiPicker })),
  toggleGlobalSearch: () => set((s) => ({ showGlobalSearch: !s.showGlobalSearch })),
  setShowGlobalSearch: (show) => set({ showGlobalSearch: show }),
  toggleInChatSearch: () => set((s) => ({ showInChatSearch: !s.showInChatSearch })),
  setShowInChatSearch: (show) => set({ showInChatSearch: show }),
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      localStorage.setItem('holio-dark-mode', String(next))
      return { darkMode: next }
    }),
  setActiveNavItem: (item) => set({ activeNavItem: item }),
  setChatListWidth: (width) => set({ chatListWidth: width }),
  setInfoPanelWidth: (width) => set({ infoPanelWidth: width }),
}))
