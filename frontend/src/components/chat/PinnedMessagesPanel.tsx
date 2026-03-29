import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Pin, PinOff, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import api from '../../services/api.service'

interface PinnedMessage {
  id: string
  content: string
  type: string
  createdAt: string
  sender?: { firstName: string; lastName?: string | null }
}

interface PinnedMessagesPanelProps {
  chatId: string
  onClose: () => void
}

export default function PinnedMessagesPanel({ chatId, onClose }: PinnedMessagesPanelProps) {
  const [messages, setMessages] = useState<PinnedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [unpinningId, setUnpinningId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get(`/chats/${chatId}/messages`, { params: { pinned: true } })
      .then(({ data }) => setMessages(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [chatId])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  const handleUnpin = async (messageId: string) => {
    setUnpinningId(messageId)
    try {
      await api.patch(`/messages/${messageId}`, { pinned: false })
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch {
      /* keep message in list on failure */
    } finally {
      setUnpinningId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-label="Pinned messages">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/25 transition-opacity duration-250',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-250 ease-out dark:bg-gray-900',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-holio-orange" />
            <h2 className="text-base font-semibold text-holio-text">Pinned Messages</h2>
            {!loading && messages.length > 0 && (
              <span className="rounded-full bg-holio-orange/10 px-2 py-0.5 text-xs font-medium text-holio-orange">
                {messages.length}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-gray-800"
            aria-label="Close pinned messages"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-holio-orange" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
                <Pin className="h-8 w-8 text-holio-lavender" />
              </div>
              <p className="mt-4 text-sm font-medium text-holio-text">No pinned messages</p>
              <p className="mt-1 text-xs text-holio-muted">
                Pin important messages to find them here
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!loading &&
              messages.map((msg) => {
                const senderName = msg.sender
                  ? [msg.sender.firstName, msg.sender.lastName].filter(Boolean).join(' ')
                  : 'Unknown'
                const isUnpinning = unpinningId === msg.id

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'rounded-2xl border border-gray-100 bg-gray-50 p-3.5 transition-opacity dark:border-gray-800 dark:bg-gray-800',
                      isUnpinning && 'pointer-events-none opacity-50',
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-holio-orange">{senderName}</span>
                      <button
                        onClick={() => handleUnpin(msg.id)}
                        disabled={isUnpinning}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        title="Unpin message"
                      >
                        <PinOff className="h-3.5 w-3.5" />
                        <span>Unpin</span>
                      </button>
                    </div>
                    <p className="line-clamp-4 text-sm leading-relaxed text-holio-text">
                      {msg.content}
                    </p>
                    <p className="mt-2 text-[11px] text-holio-muted">
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
