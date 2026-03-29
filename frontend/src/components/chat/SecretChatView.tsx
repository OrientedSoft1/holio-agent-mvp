import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Lock,
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
import { useUiStore } from '../../stores/uiStore'
import { getSocket } from '../../services/socket.service'
import { cn } from '../../lib/utils'

interface SecretChatViewProps {
  chatId: string
  peerName: string
  peerAvatar?: string | null
  peerStatus?: string
  isOnline?: boolean
  onBack?: () => void
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

export default function SecretChatView({
  chatId,
  peerName,
  peerAvatar,
  peerStatus,
  isOnline = false,
  onBack,
}: SecretChatViewProps) {
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)

  const [showBanner, setShowBanner] = useState(true)
  const [selfDestructTime, setSelfDestructTime] = useState(0)
  const [showTimerMenu, setShowTimerMenu] = useState(false)

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

  const statusText = peerStatus ?? (isOnline ? 'online' : '')
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
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Avatar with green lock badge overlay */}
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
            <div className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#C6D5BA]">
              <Lock className="h-2.5 w-2.5 text-white" />
            </div>
          </div>

          {/* Name with inline lock icon */}
          <div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#C6D5BA]" />
              <h3 className="text-sm font-semibold text-holio-text">
                {peerName}
              </h3>
            </div>
            {statusText && (
              <p className="text-xs text-holio-muted">
                {statusText === 'online' ? (
                  <span className="text-green-500">online</span>
                ) : (
                  statusText
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <Phone className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Encryption banner */}
      {showBanner && (
        <div className="flex items-center justify-center gap-2 bg-[#C6D5BA]/20 px-4 py-2">
          <Lock className="h-3.5 w-3.5 text-[#C6D5BA]" />
          <span className="text-xs font-medium text-[#6B8C5E]">
            Messages are end-to-end encrypted
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-1 rounded-full p-0.5 text-[#C6D5BA] transition-colors hover:text-[#6B8C5E]"
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

      {/* Messages area — lavender-tinted background */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto bg-[#F0EEFF] px-4 py-4"
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
        <div className="relative ml-2">
          <button
            onClick={() => setShowTimerMenu(!showTimerMenu)}
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-50',
              selfDestructTime > 0
                ? 'text-holio-orange'
                : 'text-holio-muted hover:text-holio-text',
            )}
            title={
              activeTimerLabel
                ? `Self-destruct: ${activeTimerLabel}`
                : 'Set self-destruct timer'
            }
          >
            <Timer className="h-5 w-5" />
            {activeTimerLabel && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-holio-orange px-1 text-[9px] font-bold text-white">
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
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                      selfDestructTime === opt.value
                        ? 'font-medium text-holio-orange'
                        : 'text-holio-text',
                    )}
                  >
                    {opt.label}
                    {selfDestructTime === opt.value && (
                      <Check className="h-4 w-4 text-holio-orange" />
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
