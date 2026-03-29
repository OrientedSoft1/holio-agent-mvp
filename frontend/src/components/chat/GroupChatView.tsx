import { useState, useEffect, useRef, useCallback } from 'react'
import GroupChatHeader from './GroupChatHeader'
import GroupInfoPanel from './GroupInfoPanel'
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
import type { ChatMember } from '../../types'

interface GroupChatViewProps {
  chatId: string
}

const SENDER_COLORS = [
  '#E95420', '#8E44AD', '#2980B9', '#27AE60', '#D35400',
  '#C0392B', '#16A085', '#F39C12', '#7F8C8D', '#2C3E50',
  '#1ABC9C', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71',
]

function getSenderColor(senderId: string): string {
  let hash = 0
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length]
}

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
  const fetchMessages = useChatStore((s) => s.fetchMessages)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)

  const [showInfoPanel, setShowInfoPanel] = useState(false)

  useEffect(() => {
    if (chatId) fetchMessages(chatId)
  }, [chatId, fetchMessages])

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

  const handleToggleInfo = useCallback(() => {
    setShowInfoPanel((prev) => !prev)
  }, [])

  if (!activeChat) return null

  const displayName = activeChat.name ?? 'Group'
  const chatMembers = ((activeChat as Record<string, unknown>).members ?? []) as ChatMember[]
  const memberCount = chatMembers.length || 55
  const onlineCount = Math.min(Math.floor(memberCount * 0.22), memberCount)

  const dateGroups = groupMessagesByDate(messages)

  const isSameSenderAsPrev = (idx: number) => {
    if (idx === 0) return false
    return messages[idx].senderId === messages[idx - 1].senderId
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col bg-holio-offwhite">
        <GroupChatHeader
          name={displayName}
          avatarUrl={activeChat.avatarUrl}
          avatarColor="#8b5cf6"
          memberCount={memberCount}
          onlineCount={onlineCount}
          onBack={() => useChatStore.getState().setActiveChat(null!)}
          onInfoClick={handleToggleInfo}
          onMenuClick={handleToggleInfo}
        />

        {showInChatSearch && (
          <InChatSearch
            chatId={activeChat.id}
            open={showInChatSearch}
            onClose={() => setShowInChatSearch(false)}
          />
        )}

        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto bg-gradient-to-b from-holio-lavender/20 to-holio-lavender/10 px-4 py-4"
        >
          {messagesLoading && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
            </div>
          )}

          {activeChat.unreadCount > 0 && (
            <div className="flex items-center justify-center py-2">
              <span className="rounded-full bg-holio-orange px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {activeChat.unreadCount} unread messages
              </span>
            </div>
          )}

          {dateGroups.map((group) => (
            <div key={group.label}>
              <DateSeparator label={group.label} />
              {group.indices.map((idx) => {
                const msg = messages[idx]
                const isMine = msg.senderId === currentUserId
                const sameSender = isSameSenderAsPrev(idx)
                const senderColor = !isMine ? getSenderColor(msg.senderId) : undefined
                const senderInitial = msg.sender?.firstName?.[0]?.toUpperCase() ?? '?'
                const senderFullName = msg.sender
                  ? `${msg.sender.firstName}${msg.sender.lastName ? ` ${msg.sender.lastName}` : ''}`
                  : undefined

                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
                  >
                    {!isMine && (
                      <div className="w-8 flex-shrink-0 self-end">
                        {!sameSender && (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: senderColor }}
                          >
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
                          senderName:
                            !isMine && !sameSender ? senderFullName : undefined,
                          isRead: !!((msg as Record<string, unknown>).isRead) || !!((msg as Record<string, unknown>).readAt),
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

      <div
        className={cn(
          'absolute inset-y-0 right-0 z-20 w-[340px] transform border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out',
          showInfoPanel ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <GroupInfoPanel
          chat={activeChat}
          members={chatMembers}
          onClose={() => setShowInfoPanel(false)}
          onAddMembers={() => {}}
        />
      </div>

      {showInfoPanel && (
        <div
          className="absolute inset-0 z-10 bg-black/10 md:hidden"
          onClick={() => setShowInfoPanel(false)}
        />
      )}
    </div>
  )
}
