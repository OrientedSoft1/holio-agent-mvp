import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck,
  Phone,
  MoreVertical,
  Timer,
  X,
  Check,
} from 'lucide-react'
import MessageBubble from './MessageBubble'
import DateSeparator from './DateSeparator'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import InChatSearch from '../search/InChatSearch'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { useUiStore } from '../../stores/uiStore'
import { getSocket } from '../../services/socket.service'
import api from '../../services/api.service'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

interface SecretChatViewProps {
  chat: Chat
}

const SELF_DESTRUCT_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '1s', value: 1 },
  { label: '5s', value: 5 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '1h', value: 3600 },
  { label: '1d', value: 86400 },
  { label: '1w', value: 604800 },
]

function groupMessagesByDate(messages: { createdAt: string }[]) {
  const groups: { label: string; indices: number[] }[] = []
  let lastLabel = ''

  messages.forEach((msg, i) => {
    const date = new Date(msg.createdAt)
    const diffDays = Math.floor(
      (new Date().getTime() - date.getTime()) / 86_400_000,
    )

    let label: string
    if (diffDays === 0) label = 'Today'
    else if (diffDays === 1) label = 'Yesterday'
    else
      label = date.toLocaleDateString([], {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

    if (label !== lastLabel) {
      groups.push({ label, indices: [i] })
      lastLabel = label
    } else {
      groups[groups.length - 1].indices.push(i)
    }
  })

  return groups
}

function formatRelTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : 'recently'
}

export default function SecretChatView({ chat }: SecretChatViewProps) {
  const chatId = chat.id
  const peerName = chat.name ?? 'Secret Chat'
  const peerAvatar = chat.avatarUrl

  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)

  const [peerUserId, setPeerUserId] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(true)
  const [selfDestructTime, setSelfDestructTime] = useState(0)
  const [showTimerMenu, setShowTimerMenu] = useState(false)

  const isOnline = usePresenceStore((s) =>
    peerUserId ? !!s.onlineUsers[peerUserId] : false,
  )
  const lastSeen = usePresenceStore((s) =>
    peerUserId ? s.lastSeen[peerUserId] : undefined,
  )

  useEffect(() => {
    if (!currentUserId) return
    api
      .get(`/chats/${chatId}/members`)
      .then(({ data }) => {
        const other = data.find((m: { userId: string }) => m.userId !== currentUserId)
        if (other) setPeerUserId(other.userId)
      })
      .catch(() => {})
  }, [chatId, currentUserId])

  useEffect(() => {
    api
      .get(`/chats/${chatId}`)
      .then(({ data }) => {
        if (data.selfDestructTimer != null)
          setSelfDestructTime(data.selfDestructTimer)
      })
      .catch(() => {})
  }, [chatId])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!messages.length || !currentUserId) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.senderId === currentUserId) return
    if (lastReadRef.current === lastMsg.id) return

    lastReadRef.current = lastMsg.id
    const socket = getSocket()
    if (socket) {
      socket.emit('message:read', { chatId, messageId: lastMsg.id })
    }
  }, [chatId, messages, currentUserId])

  const initials = peerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const statusText = isOnline
    ? 'online'
    : lastSeen
      ? `last seen ${formatRelTime(lastSeen)}`
      : ''
  const dateGroups = groupMessagesByDate(messages)
  const activeTimerLabel =
    selfDestructTime > 0
      ? SELF_DESTRUCT_OPTIONS.find((o) => o.value === selfDestructTime)?.label
      : null

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {peerAvatar ? (
              <img
                src={peerAvatar}
                alt={peerName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-sage text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            {isOnline && (
              <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-holio-sage" />
              <h3 className="text-sm font-semibold text-holio-sage">
                {peerName}
              </h3>
            </div>
            {statusText && (
              <p className="text-xs text-holio-muted">{statusText}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            title="Voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            title="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Encryption banner */}
      {showBanner && (
        <div className="mx-4 mt-2 flex items-center gap-2.5 rounded-xl border border-holio-sage/20 bg-holio-sage/10 p-3">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-holio-sage" />
          <span className="flex-1 text-xs font-medium text-holio-sage">
            Messages are end-to-end encrypted
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="rounded-full p-0.5 text-holio-sage/50 transition-colors hover:text-holio-sage"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {showInChatSearch && (
        <InChatSearch
          chatId={chatId}
          open={showInChatSearch}
          onClose={() => setShowInChatSearch(false)}
        />
      )}

      {/* Messages area with lavender gradient */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto bg-gradient-to-b from-holio-sage/10 to-holio-lavender/10 px-4 py-4"
      >
        {messagesLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {dateGroups.map((group) => (
          <div key={group.label}>
            <DateSeparator label={group.label} />
            {group.indices.map((idx) => {
              const msg = messages[idx]
              const msgRecord = msg as unknown as Record<string, unknown>
              return (
                <MessageBubble
                  key={msg.id}
                  rawMessage={msg}
                  isSecretChat
                  message={{
                    id: msg.id,
                    content: msg.content,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    isMine: msg.senderId === currentUserId,
                    senderName: msg.sender?.firstName,
                    isRead: !!msgRecord.isRead || !!msgRecord.readAt,
                    isEdited: !!msgRecord.isEdited,
                    isGroup: false,
                    type: msg.type,
                    fileUrl: msg.fileUrl,
                    metadata: msg.metadata,
                    reactions: msg.reactions,
                    scheduledAt: msg.scheduledAt,
                    currentUserId,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <TypingIndicator chatId={chatId} />

      {/* Input area with self-destruct timer */}
      <div className="flex items-center gap-0 bg-white">
        <div className="relative">
          <button
            onClick={() => setShowTimerMenu(!showTimerMenu)}
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ml-2',
              selfDestructTime > 0
                ? 'bg-holio-sage/10 text-holio-sage'
                : 'text-holio-muted hover:bg-gray-50 hover:text-holio-text',
            )}
            title={
              activeTimerLabel
                ? `Self-destruct: ${activeTimerLabel}`
                : 'Set self-destruct timer'
            }
          >
            <Timer className="h-5 w-5" />
            {activeTimerLabel && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-holio-sage px-1 text-[9px] font-bold text-white">
                {activeTimerLabel}
              </span>
            )}
          </button>
          {showTimerMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTimerMenu(false)}
              />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
                  Self-destruct timer
                </p>
                {SELF_DESTRUCT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelfDestructTime(opt.value)
                      setShowTimerMenu(false)
                      api
                        .patch(`/chats/${chatId}/self-destruct`, {
                          timer: opt.value,
                        })
                        .catch(() => {})
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                      selfDestructTime === opt.value
                        ? 'font-medium text-holio-sage'
                        : 'text-holio-text',
                    )}
                  >
                    {opt.label}
                    {selfDestructTime === opt.value && (
                      <Check className="h-4 w-4 text-holio-sage" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <MessageInput chatId={chatId} />
        </div>
      </div>
    </div>
  )
}
