import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, Send, X, CalendarClock } from 'lucide-react'
import api from '../services/api.service'

interface ScheduledMessage {
  id: string
  content: string
  chatId: string
  chatName: string
  scheduledAt: string
}

function formatScheduledDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000)

  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return `Today at ${time}`
  if (diffDays === 1) return `Tomorrow at ${time}`
  if (diffDays > 1 && diffDays < 7)
    return `${d.toLocaleDateString([], { weekday: 'long' })} at ${time}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`
}

export default function ScheduledMessagesPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .get<ScheduledMessage[]>('/messages/scheduled')
      .then((res) => {
        if (!cancelled) setMessages(res.data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load scheduled messages')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cancelScheduled = async (id: string) => {
    setActionId(id)
    try {
      await api.delete(`/messages/${id}/schedule`)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setError('Failed to cancel scheduled message')
    } finally {
      setActionId(null)
    }
  }

  const sendNow = async (id: string) => {
    setActionId(id)
    try {
      await api.post(`/messages/${id}/send-now`)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setError('Failed to send message')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-bold text-holio-text">Scheduled Messages</h1>
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
              <CalendarClock className="h-10 w-10 text-holio-lavender" />
            </div>
            <h2 className="mb-1 text-base font-semibold text-holio-text">No scheduled messages</h2>
            <p className="max-w-xs text-center text-sm text-holio-muted">
              Long press the send button in any chat to schedule a message for later
            </p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
              {messages.length} Scheduled
            </p>
            <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
              {messages.map((msg, i) => (
                <div key={msg.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-holio-orange/10">
                      <Clock className="h-5 w-5 text-holio-orange" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-holio-text">{msg.content}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-holio-muted">{msg.chatName}</span>
                        <span className="text-xs text-holio-muted">·</span>
                        <span className="text-xs text-holio-muted">
                          {formatScheduledDate(msg.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => sendNow(msg.id)}
                        disabled={actionId === msg.id}
                        title="Send now"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-holio-orange/10 disabled:opacity-40"
                      >
                        <Send className="h-4 w-4 text-holio-orange" />
                      </button>
                      <button
                        onClick={() => cancelScheduled(msg.id)}
                        disabled={actionId === msg.id}
                        title="Cancel"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
                      >
                        <X className="h-4 w-4 text-holio-muted hover:text-red-500" />
                      </button>
                    </div>
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
