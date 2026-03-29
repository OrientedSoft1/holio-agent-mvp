import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api.service'
import type { Chat } from '../../types'

interface ForwardMessageModalProps {
  open: boolean
  messageId: string
  onClose: () => void
}

function getChatDisplayName(chat: Chat, currentUserId?: string): string {
  if (chat.type === 'channel') return `# ${chat.name ?? 'channel'}`
  if (chat.name) return chat.name
  if (chat.type === 'private' && chat.members) {
    const other = chat.members.find((m) => m.userId !== currentUserId)
    if (other?.user) {
      return [other.user.firstName, other.user.lastName].filter(Boolean).join(' ')
    }
  }
  return 'Chat'
}

export default function ForwardMessageModal({ open, messageId, onClose }: ForwardMessageModalProps) {
  const [search, setSearch] = useState('')
  const [forwarding, setForwarding] = useState(false)
  const chats = useChatStore((s) => s.chats)
  const currentUserId = useAuthStore((s) => s.user?.id)

  const filtered = useMemo(() => {
    if (!search) return chats
    const q = search.toLowerCase()
    return chats.filter((c) =>
      getChatDisplayName(c, currentUserId).toLowerCase().includes(q),
    )
  }, [chats, search, currentUserId])

  const handleForward = async (targetChatId: string) => {
    if (forwarding) return
    setForwarding(true)
    try {
      await api.post('/messages/forward', { messageId, targetChatId })
      onClose()
    } catch {
      /* silent for now */
    } finally {
      setForwarding(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl dark:bg-[#1E3035]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-holio-text dark:text-white">Forward Message</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-holio-muted" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-[#152022]">
            <Search className="h-4 w-4 text-holio-muted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="h-3.5 w-3.5 text-holio-muted" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-holio-muted">
              {search ? `No chats match "${search}"` : 'No chats available'}
            </p>
          )}
          {filtered.map((chat) => {
            const name = getChatDisplayName(chat, currentUserId)
            const initials = name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <button
                key={chat.id}
                onClick={() => handleForward(chat.id)}
                disabled={forwarding}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
              >
                <div className="flex-shrink-0">
                  {chat.avatarUrl ? (
                    <img src={chat.avatarUrl} alt={name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-holio-lavender/30 text-xs font-semibold text-holio-text dark:text-white">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-holio-text dark:text-white">{name}</p>
                  <p className="truncate text-xs capitalize text-holio-muted">{chat.type}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
