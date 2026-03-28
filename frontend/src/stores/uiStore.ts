import { create } from 'zustand'

interface UiState {
  showInfoPanel: boolean
  showEmojiPicker: boolean
  darkMode: boolean
  toggleInfoPanel: () => void
  toggleEmojiPicker: () => void
  toggleDarkMode: () => void
}

export const useUiStore = create<UiState>((set) => ({
  showInfoPanel: false,
  showEmojiPicker: false,
  darkMode: false,
  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  toggleEmojiPicker: () => set((s) => ({ showEmojiPicker: !s.showEmojiPicker })),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode }))
}))
