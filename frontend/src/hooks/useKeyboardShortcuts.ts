import { useEffect, useCallback } from 'react'
import { useUiStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)
  const toggleGlobalSearch = useUiStore((s) => s.toggleGlobalSearch)

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey

      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        toggleGlobalSearch()
        return
      }

      if (e.key === 'Escape') {
        setShowInfoPanel(false)
        return
      }

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      if (isInput) return

      if (mod && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        toggleDarkMode()
        return
      }
    },
    [toggleDarkMode, setShowInfoPanel, toggleGlobalSearch],
  )

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}
