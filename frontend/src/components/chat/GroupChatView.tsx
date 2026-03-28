import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Phone, MoreVertical } from 'lucide-react'
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

interface GroupChatViewProps {
  chatId: string
}

const DEMO_TOPICS = ['General', 'Design', 'Development', 'Marketing', 'Random']

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

export default function GroupChatView({ chatId }: GroupChatViewProps) {
  const activeChat = useChatStore((s) => s.activeChat)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)

  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const hasTopics = activeChat?.type === 'group' && (activeChat as any).topics?.length > 0
  const topics: string[] = hasTopics ? (activeChat as any).topics : DEMO_TOPICS

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, activeTopic])

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

  const displayName = activeChat.name ?? 'Group'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const memberCount = (activeChat as any).members?.length ?? 0

  const filteredMessages = activeTopic
    ? messages.filter((msg) => (msg.metadata as any)?.topic === activeTopic)
    : messages

  const dateGroups = groupMessagesByDate(filteredMessages)

  const isSameSenderAsPrev = (idx: number) => {
    if (idx === 0) return false
    return filteredMessages[idx].senderId === filteredMessages[idx - 1].senderId
  }

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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-holio-text">{displayName}</h3>
            <p className="text-xs text-holio-muted">{memberCount} members</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
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

      {hasTopics && (
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2 scrollbar-hide">
          <button
            onClick={() => setActiveTopic(null)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeTopic === null
                ? 'bg-holio-orange text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            All
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={cn(
                'flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeTopic === topic
                  ? 'bg-holio-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {showInChatSearch && (
        <InChatSearch
          chatId={activeChat.id}
          open={showInChatSearch}
          onClose={() => setShowInChatSearch(false)}
        />
      )}

      <div ref={scrollRef} className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4">
        {messagesLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {dateGroups.map((group) => (
          <div key={group.label}>
            <DateSeparator label={group.label} />
            {group.indices.map((idx) => {
              const msg = filteredMessages[idx]
              const isMine = msg.senderId === currentUserId
              const sameSender = isSameSenderAsPrev(idx)
              const senderInitial = msg.sender?.firstName?.[0]?.toUpperCase() ?? '?'

              return (
                <div key={msg.id} className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
                  {!isMine && (
                    <div className="w-6 flex-shrink-0">
                      {!sameSender && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-holio-lavender/30 text-[10px] font-semibold text-holio-text">
                          {senderInitial}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="min-w-0 max-w-[70%]">
                    <MessageBubble
                      rawMessage={msg}
                      message={{
                        id: msg.id,
                        content: msg.content,
                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        isMine,
                        senderName: !isMine && !sameSender ? msg.sender?.firstName : undefined,
                        isRead: !!(msg as any).isRead || !!(msg as any).readAt,
                        isGroup: true,
                        type: msg.type,
                        fileUrl: msg.fileUrl,
                        metadata: msg.metadata,
                        reactions: msg.reactions,
                        scheduledAt: msg.scheduledAt,
                        currentUserId,
                      }}
                    />
                  </div>
                </div>
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
