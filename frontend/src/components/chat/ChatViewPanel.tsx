import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import DateSeparator from './DateSeparator'
import MessageInput from './MessageInput'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import type { Chat } from '../../types'

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

function getChatDisplayInfo(chat: Chat) {
  const isChannel = chat.type === 'channel'
  const displayName = isChannel ? `# ${chat.name ?? 'channel'}` : chat.name ?? 'Chat'
  const initials = isChannel
    ? '#'
    : displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = {
    private: '#6366f1',
    group: '#059669',
    channel: '#8b5cf6',
    bot: '#FF9220',
  }
  return { displayName, initials, color: colorMap[chat.type] ?? '#6366f1' }
}

export default function ChatViewPanel() {
  const activeChat = useChatStore((s) => s.activeChat)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-holio-offwhite">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/30">
          <MessageSquare className="h-10 w-10 text-holio-lavender" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-holio-text">
          Select a chat to start messaging
        </h3>
        <p className="mt-1 text-sm text-holio-muted">
          Choose a conversation from the list
        </p>
      </div>
    )
  }

  const { displayName, initials, color } = getChatDisplayInfo(activeChat)
  const isGroupLike = activeChat.type === 'group' || activeChat.type === 'channel'
  const dateGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      <ChatHeader
        name={displayName}
        avatarUrl={activeChat.avatarUrl}
        initials={initials}
        avatarColor={color}
        status="online"
        isOnline
      />

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
                  message={{
                    id: msg.id,
                    content: msg.content,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    isMine: msg.senderId === currentUserId,
                    senderName: msg.sender?.firstName,
                    isRead: true,
                    isGroup: isGroupLike,
                    type: msg.type,
                    fileUrl: msg.fileUrl,
                    metadata: msg.metadata,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <MessageInput chatId={activeChat.id} />
    </div>
  )
}
