import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bookmark, Trash2, Image, FileText, MessageSquare } from 'lucide-react'
import api from '../services/api.service'

interface SavedMessage {
  id: string
  content: string
  type: 'text' | 'image' | 'file'
  chatId: string
  chatName: string
  fileUrl?: string
  createdAt: string
}

const typeIcon = {
  text: MessageSquare,
  image: Image,
  file: FileText,
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

export default function SavedMessagesPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .get<SavedMessage[]>('/saved-messages')
      .then((res) => {
        if (!cancelled) setMessages(res.data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load saved messages')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const unsaveMessage = async (id: string) => {
    setRemovingId(id)
    try {
      await api.delete(`/saved-messages/${id}`)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setError('Failed to remove message')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/chat')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-bold text-holio-text">Saved Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {loading && (
          <div className="flex items-center justify-center pt-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="px-4 pt-8 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 pt-24">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/30">
              <Bookmark className="h-10 w-10 text-holio-lavender" />
            </div>
            <h2 className="mb-1 text-base font-semibold text-holio-text">No saved messages yet</h2>
            <p className="text-sm text-holio-muted">Bookmark messages to find them here later</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
              Saved Messages
            </p>
            <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
              {messages.map((msg, i) => {
                const Icon = typeIcon[msg.type]
                return (
                  <div key={msg.id}>
                    {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                    <div className="flex items-start gap-3 px-4 py-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-holio-orange/10">
                        <Icon className="h-5 w-5 text-holio-orange" />
                      </div>
                      <button
                        onClick={() => navigate(`/chat?id=${msg.chatId}`)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="line-clamp-2 text-sm text-holio-text">
                          {msg.type === 'image' && !msg.content ? 'Photo' : msg.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-holio-muted">{msg.chatName}</span>
                          <span className="text-xs text-holio-muted">·</span>
                          <span className="text-xs text-holio-muted">{formatTimestamp(msg.createdAt)}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => unsaveMessage(msg.id)}
                        disabled={removingId === msg.id}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4 text-holio-muted hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
