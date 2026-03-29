import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Archive, Search, ArchiveRestore } from 'lucide-react'
import api from '../services/api.service'

interface ArchivedChat {
  id: string
  name: string
  avatarUrl?: string
  lastMessage?: string
  updatedAt: string
  isGroup?: boolean
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function avatarInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ArchivedChatsPage() {
  const navigate = useNavigate()
  const [chats, setChats] = useState<ArchivedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get<ArchivedChat[]>('/chats', { params: { archived: true } })
      .then((res) => {
        if (!cancelled) setChats(res.data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load archived chats')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return chats
    const q = query.toLowerCase()
    return chats.filter(
      (c) => c.name.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q),
    )
  }, [chats, query])

  const unarchiveChat = async (id: string) => {
    setUnarchivingId(id)
    try {
      await api.put(`/chats/${id}/unarchive`)
      setChats((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Failed to unarchive chat')
    } finally {
      setUnarchivingId(null)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-holio-text">Archived Chats</h1>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Search className="h-5 w-5 text-holio-muted" />
        </button>
      </div>

      {showSearch && (
        <div className="px-4 pb-2">
          <input
            type="text"
            placeholder="Search archived chats…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-holio-text placeholder:text-holio-muted focus:border-holio-orange focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-8">
        {loading && (
          <div className="flex items-center justify-center pt-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="px-4 pt-8 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 pt-24">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/30">
              <Archive className="h-10 w-10 text-holio-lavender" />
            </div>
            <h2 className="mb-1 text-base font-semibold text-holio-text">
              {query.trim() ? 'No matching chats' : 'No archived chats'}
            </h2>
            <p className="text-sm text-holio-muted">
              {query.trim()
                ? 'Try a different search term'
                : 'Chats you archive will appear here'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
              {filtered.length} archived {filtered.length === 1 ? 'chat' : 'chats'}
            </p>
            <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
              {filtered.map((chat, i) => (
                <div key={chat.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {chat.avatarUrl ? (
                      <img
                        src={chat.avatarUrl}
                        alt={chat.name}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange/10 text-sm font-semibold text-holio-orange">
                        {avatarInitials(chat.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-semibold text-holio-text">
                          {chat.name}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-xs text-holio-muted">
                          {formatTimestamp(chat.updatedAt)}
                        </span>
                      </div>
                      {chat.lastMessage && (
                        <p className="mt-0.5 truncate text-xs text-holio-muted">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => unarchiveChat(chat.id)}
                      disabled={unarchivingId === chat.id}
                      title="Unarchive"
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-holio-orange/10 disabled:opacity-40"
                    >
                      <ArchiveRestore className="h-4 w-4 text-holio-muted hover:text-holio-orange" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
