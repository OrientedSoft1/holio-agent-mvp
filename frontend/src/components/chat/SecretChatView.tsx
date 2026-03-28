import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Lock,
  Phone,
  MoreVertical,
  Clock,
  Search,
  Check,
  CheckCheck,
} from 'lucide-react'
import MessageBubble from './MessageBubble'
import DateSeparator from './DateSeparator'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import InChatSearch from '../search/InChatSearch'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { getSocket } from '../../services/socket.service'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

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
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)

    let label: string
    if (diffDays === 0) label = 'Today'
    else if (diffDays === 1) label = 'Yesterday'
    else label = date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })

    if (label !== lastLabel) {
      groups.push({ label, indices: [i] })
      lastLabel = label
    } else {
      groups[groups.length - 1].indices.push(i)
    }
  })

  return groups
}

export default function SecretChatView() {
  const activeChat = useChatStore((s) => s.activeChat)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)

  const [selfDestructTime, setSelfDestructTime] = useState(0)
  const [showTimerMenu, setShowTimerMenu] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!activeChat || !messages.length || !currentUserId) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.senderId === currentUserId) return
    if (lastReadRef.current === lastMsg.id) return

    lastReadRef.current = lastMsg.id
    const socket = getSocket()
    if (socket) {
      socket.emit('message:read', { chatId: activeChat.id, messageId: lastMsg.id })
    }
  }, [activeChat, messages, currentUserId])

  if (!activeChat) return null

  const displayName = activeChat.name ?? 'Secret Chat'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const dateGroups = groupMessagesByDate(messages)

  const chatMembers = (activeChat as any).members as { userId: string }[] | undefined
  const otherUserId = chatMembers?.find((m) => m.userId !== currentUserId)?.userId
  const peerOnline = usePresenceStore((s) => otherUserId ? s.onlineUsers.has(otherUserId) : false)
  const peerLastSeen = usePresenceStore((s) => otherUserId ? s.lastSeen[otherUserId] : undefined)

  const statusText = peerOnline
    ? 'online'
    : peerLastSeen
      ? `last seen ${new Date(peerLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : ''

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative">
            {activeChat.avatarUrl ? (
              <img
                src={activeChat.avatarUrl}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-sage text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            <div className="absolute right-0 bottom-0 rounded-full bg-holio-sage p-0.5">
              <Lock className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-holio-text">{displayName}</h3>
              <Lock className="h-3.5 w-3.5 text-holio-sage" />
            </div>
            <p className="text-xs text-holio-muted">{statusText}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowTimerMenu(!showTimerMenu)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-50',
                selfDestructTime > 0 ? 'text-holio-orange' : 'text-holio-muted hover:text-holio-text',
              )}
            >
              <Clock className="h-5 w-5" />
            </button>
            {showTimerMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
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
            )}
          </div>
          {[Phone, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 bg-holio-sage/10 py-2">
        <Lock className="h-3.5 w-3.5 text-holio-sage" />
        <span className="text-xs text-holio-sage">Messages are end-to-end encrypted</span>
      </div>

      {showInChatSearch && (
        <InChatSearch
          chatId={activeChat.id}
          open={showInChatSearch}
          onClose={() => setShowInChatSearch(false)}
        />
      )}

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-4">
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
                    isRead: !!(msg as any).isRead || !!(msg as any).readAt,
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

      <TypingIndicator chatId={activeChat.id} />
      <MessageInput chatId={activeChat.id} />
    </div>
  )
}
