import { create } from 'zustand'

export type NavItem = 'all' | 'personal' | 'company' | 'channels' | 'bots' | 'favorites' | 'stories' | 'contacts'

interface UiState {
  showInfoPanel: boolean
  showEmojiPicker: boolean
  darkMode: boolean
  activeNavItem: NavItem
  chatListWidth: number
  infoPanelWidth: number
  toggleInfoPanel: () => void
  setShowInfoPanel: (show: boolean) => void
  toggleEmojiPicker: () => void
  toggleDarkMode: () => void
  setActiveNavItem: (item: NavItem) => void
  setChatListWidth: (width: number) => void
  setInfoPanelWidth: (width: number) => void
}

const storedDark = localStorage.getItem('holio-dark-mode') === 'true'

export const useUiStore = create<UiState>((set) => ({
  showInfoPanel: false,
  showEmojiPicker: false,
  darkMode: storedDark,
  activeNavItem: 'all',
  chatListWidth: 320,
  infoPanelWidth: 300,
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  setShowInfoPanel: (show) => set({ showInfoPanel: show }),
  toggleEmojiPicker: () => set((s) => ({ showEmojiPicker: !s.showEmojiPicker })),
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
