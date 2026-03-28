import { useEffect, useCallback } from 'react'
import { useUiStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      if (e.key === 'Escape') {
        setShowInfoPanel(false)
        return
      }

      if (isInput && e.key !== 'Escape') return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        toggleDarkMode()
        return
      }

      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        searchInput?.focus()
        return
      }
    },
    [toggleDarkMode, setShowInfoPanel],
  )

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}
