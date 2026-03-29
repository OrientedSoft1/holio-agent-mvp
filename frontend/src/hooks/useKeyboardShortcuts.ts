import { useEffect, useCallback } from 'react'
import { useUiStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)
  const toggleGlobalSearch = useUiStore((s) => s.toggleGlobalSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey

      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        toggleGlobalSearch()
        return
      }

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      if (e.key === 'Escape') {
        if (!isInput) setShowInfoPanel(false)
        return
      }

      if (isInput) return

      if (mod && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        toggleDarkMode()
        return
      }

      // Ctrl+F: In-chat search
      if (mod && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        setShowInChatSearch(true)
        return
      }

      // Ctrl+Shift+M: Mute active chat (placeholder - just toggles info panel as workaround)
      if (mod && e.shiftKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault()
        return
      }
    },
    [toggleDarkMode, setShowInfoPanel, toggleGlobalSearch, setShowInChatSearch],
  )

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}
