import { useEffect, useRef } from 'react'
import { Search, X, ChevronUp, ChevronDown, Image, Video, FileText, Link2, Mic } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'

interface InChatSearchProps {
  chatId: string
  open: boolean
  onClose: () => void
  onNavigateToMessage?: (messageId: string) => void
}

const MEDIA_FILTERS = [
  { key: 'image', label: 'Photos', icon: Image },
  { key: 'video', label: 'Videos', icon: Video },
  { key: 'file', label: 'Files', icon: FileText },
  { key: 'link', label: 'Links', icon: Link2 },
  { key: 'voice', label: 'Voice', icon: Mic },
] as const

export default function InChatSearch({ chatId, open, onClose, onNavigateToMessage }: InChatSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const query = useSearchStore((s) => s.inChatQuery)
  const setQuery = useSearchStore((s) => s.setInChatQuery)
  const results = useSearchStore((s) => s.inChatResults)
  const total = useSearchStore((s) => s.inChatTotal)
  const currentIndex = useSearchStore((s) => s.inChatIndex)
  const setIndex = useSearchStore((s) => s.setInChatIndex)
  const search = useSearchStore((s) => s.inChatSearch)
  const loading = useSearchStore((s) => s.inChatLoading)
  const clearSearch = useSearchStore((s) => s.clearInChatSearch)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      clearSearch()
    }
  }, [open, clearSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && chatId) {
        search(chatId, query)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, chatId, search])

  useEffect(() => {
    if (results[currentIndex]) {
      onNavigateToMessage?.(results[currentIndex].id)
    }
  }, [currentIndex, results, onNavigateToMessage])

  if (!open) return null

  const handlePrev = () => {
    if (currentIndex > 0) setIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (currentIndex < results.length - 1) setIndex(currentIndex + 1)
  }

  const handleFilterClick = (type: string) => {
    if (chatId && query.trim()) {
      search(chatId, query, { type })
    }
  }

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-holio-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in conversation..."
          className="flex-1 text-sm text-holio-text outline-none placeholder:text-holio-muted"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) handlePrev()
              else handleNext()
            }
            if (e.key === 'Escape') onClose()
          }}
        />

        {total > 0 && (
          <span className="text-xs text-holio-muted">
            {currentIndex + 1} of {total}
          </span>
        )}

        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
        )}

        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="flex h-7 w-7 items-center justify-center rounded text-holio-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= results.length - 1}
          className="flex h-7 w-7 items-center justify-center rounded text-holio-muted transition-colors hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-holio-muted transition-colors hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-1.5">
        {MEDIA_FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleFilterClick(key)}
            className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs text-holio-muted transition-colors hover:bg-holio-lavender/20 hover:text-holio-text"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
