import { useEffect, useRef } from 'react'
import { Search, X, Clock, MessageSquare, User as UserIcon, Hash } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'
import type { User } from '../../types'

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
  onSelectChat?: (chatId: string) => void
  onSelectUser?: (user: User) => void
}

export default function GlobalSearch({ open, onClose, onSelectChat, onSelectUser }: GlobalSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const query = useSearchStore((s) => s.query)
  const setQuery = useSearchStore((s) => s.setQuery)
  const results = useSearchStore((s) => s.results)
  const loading = useSearchStore((s) => s.loading)
  const globalSearch = useSearchStore((s) => s.globalSearch)
  const clearResults = useSearchStore((s) => s.clearResults)
  const recentSearches = useSearchStore((s) => s.recentSearches)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      clearResults()
    }
  }, [open, clearResults])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (!open) {
          /* parent handles open */
        } else {
          onClose()
        }
      }
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) globalSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, globalSearch])

  if (!open) return null

  function highlightMatch(text: string, q: string) {
    if (!q.trim()) return text
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-holio-orange/20 px-0.5 text-holio-text">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 pt-24" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search className="h-5 w-5 text-holio-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats, contacts, messages..."
            className="flex-1 text-sm text-holio-text outline-none placeholder:text-holio-muted"
          />
          {query && (
            <button onClick={() => { setQuery(''); clearResults() }}>
              <X className="h-4 w-4 text-holio-muted" />
            </button>
          )}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-holio-muted">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
            </div>
          )}

          {!query.trim() && !results && (
            <div className="px-4 py-3">
              {recentSearches.length > 0 ? (
                <>
                  <p className="mb-2 text-xs font-medium text-holio-muted uppercase">Recent Searches</p>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-holio-text hover:bg-gray-50"
                    >
                      <Clock className="h-3.5 w-3.5 text-holio-muted" />
                      {s}
                    </button>
                  ))}
                </>
              ) : (
                <p className="py-6 text-center text-sm text-holio-muted">
                  Type to search across your chats and contacts
                </p>
              )}
            </div>
          )}

          {results && !loading && (
            <>
              {results.chats.length > 0 && (
                <div className="px-4 py-2">
                  <p className="mb-1 text-xs font-medium text-holio-muted uppercase">Chats</p>
                  {results.chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => { onSelectChat?.(chat.id); onClose() }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-lavender/20">
                        <Hash className="h-4 w-4 text-holio-lavender" />
                      </div>
                      <span className="text-sm text-holio-text">
                        {highlightMatch(chat.name ?? 'Chat', query)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div className="px-4 py-2">
                  <p className="mb-1 text-xs font-medium text-holio-muted uppercase">Contacts</p>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => { onSelectUser?.(user); onClose() }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-holio-sage/20">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-holio-sage" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-holio-text">
                          {highlightMatch(
                            [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.phone,
                            query,
                          )}
                        </p>
                        {user.username && (
                          <p className="text-xs text-holio-muted">@{user.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.messages.length > 0 && (
                <div className="px-4 py-2">
                  <p className="mb-1 text-xs font-medium text-holio-muted uppercase">Messages</p>
                  {results.messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => { onSelectChat?.(msg.chatId); onClose() }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-orange/10">
                        <MessageSquare className="h-4 w-4 text-holio-orange" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs text-holio-muted">
                          {msg.sender?.firstName ?? 'Unknown'}
                        </p>
                        <p className="truncate text-sm text-holio-text">
                          {highlightMatch(msg.content ?? '', query)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.chats.length === 0 &&
                results.users.length === 0 &&
                results.messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-holio-muted">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
