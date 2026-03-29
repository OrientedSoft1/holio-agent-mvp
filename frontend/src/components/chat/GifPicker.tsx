import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import api from '../../services/api.service'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

interface Gif {
  id: string
  url: string
  previewUrl: string
  title: string
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<Gif[]>([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const endpoint = query.trim() ? '/gifs/search' : '/gifs/trending'
        const params = query.trim() ? { q: query, limit: 20 } : { limit: 20 }
        const { data } = await api.get<Gif[]>(endpoint, { params })
        setGifs(data)
      } catch {
        setGifs([])
      } finally {
        setLoading(false)
      }
    }, query ? 300 : 0)
    return () => clearTimeout(timer)
  }, [query])

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
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-holio-muted" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-sm text-holio-muted">
            No GIFs found
          </div>
        ) : (
          gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.url)}
              className="overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
            >
              <img
                src={gif.previewUrl}
                alt={gif.title}
                className="w-full object-cover"
                loading="lazy"
              />
            </button>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 px-3 py-1.5 text-center text-[10px] text-holio-muted">
        Powered by GIPHY
      </div>
    </div>
  )
}
