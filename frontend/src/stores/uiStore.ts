import { create } from 'zustand'

export type NavItem = 'all' | 'personal' | 'company' | 'channels' | 'bots' | 'favorites' | 'stories'

interface UiState {
  showInfoPanel: boolean
  showEmojiPicker: boolean
  darkMode: boolean
  activeNavItem: NavItem
  toggleInfoPanel: () => void
  setShowInfoPanel: (show: boolean) => void
  toggleEmojiPicker: () => void
  toggleDarkMode: () => void
  setActiveNavItem: (item: NavItem) => void
}

export const useUiStore = create<UiState>((set) => ({
  showInfoPanel: false,
  showEmojiPicker: false,
  darkMode: false,
  activeNavItem: 'all',
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  setShowInfoPanel: (show) => set({ showInfoPanel: show }),
  toggleEmojiPicker: () => set((s) => ({ showEmojiPicker: !s.showEmojiPicker })),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setActiveNavItem: (item) => set({ activeNavItem: item }),
}))
