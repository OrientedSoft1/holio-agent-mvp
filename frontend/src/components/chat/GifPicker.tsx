import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

const PLACEHOLDER_GIFS = Array.from({ length: 12 }, (_, i) => ({
  id: `gif-${i}`,
  url: `https://placehold.co/200x${140 + (i % 3) * 30}/D1CBFB/152022?text=GIF+${i + 1}`,
}))

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const filteredGifs = query
    ? PLACEHOLDER_GIFS.filter((_, i) => i % 2 === 0)
    : PLACEHOLDER_GIFS

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 mb-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      <div className="flex items-center gap-2 border-b border-gray-100 p-3">
        <Search className="h-4 w-4 text-holio-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="flex-1 text-sm text-holio-text outline-none placeholder:text-holio-muted"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-holio-muted hover:text-holio-text">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto p-2">
        {filteredGifs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => onSelect(gif.url)}
            className="overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
          >
            <img
              src={gif.url}
              alt="GIF"
              className="w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 px-3 py-1.5 text-center text-[10px] text-holio-muted">
        Powered by GIPHY
      </div>
    </div>
  )
}
