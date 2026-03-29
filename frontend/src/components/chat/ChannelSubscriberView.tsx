import { useRef, useEffect, useState } from 'react'
import {
  MoreVertical,
  BellOff,
  Bell,
  Pin,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useUiStore } from '../../stores/uiStore'
import api from '../../services/api.service'
import type { Chat, Message } from '../../types'

interface ChannelSubscriberViewProps {
  chat: Chat
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChannelSubscriberView({ chat }: ChannelSubscriberViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const fetchMessages = useChatStore((s) => s.fetchMessages)

  const channelName = chat.name ?? 'Channel'
  const channelAvatar = chat.avatarUrl
  const subscriberCount = chat.members?.length ?? 0
  const isMuted = chat.muted ?? false
  const [localMuted, setLocalMuted] = useState(isMuted)
  const pinnedMessage = chat.pinnedMessage ?? undefined
  const toggleInfoPanel = useUiStore((s) => s.toggleInfoPanel)

  useEffect(() => {
    fetchMessages(chat.id)
  }, [chat.id, fetchMessages])

  const initials = channelName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleInfoPanel}
            className="flex items-center gap-3 text-left"
          >
            {channelAvatar ? (
              <img
                src={channelAvatar}
                alt={channelName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-text">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-holio-text">
                {channelName}
              </h3>
              <p className="text-xs text-holio-muted">
                {subscriberCount.toLocaleString()} subscribers
              </p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              try {
                if (localMuted) {
                  await api.post(`/chats/${chat.id}/unmute`)
                  setLocalMuted(false)
                } else {
                  await api.post(`/chats/${chat.id}/mute`, { duration: 'forever' })
                  setLocalMuted(true)
                }
              } catch { /* mute toggle failed */ }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            {localMuted ? (
              <BellOff className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pinned message */}
      {pinnedMessage && (
        <button className="flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-2 text-left transition-colors hover:bg-gray-50">
          <Pin className="h-4 w-4 flex-shrink-0 text-holio-orange" />
          <span className="truncate text-xs text-holio-text">
            {pinnedMessage}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 text-holio-muted" />
        </button>
      )}

      {/* Posts */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        {messagesLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}
        {!messagesLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-holio-muted">No posts yet</p>
          </div>
        )}
        {messages.map((post: Message) => (
          <div
            key={post.id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                {channelAvatar ? (
                  <img
                    src={channelAvatar}
                    alt={channelName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-holio-lavender text-[10px] font-semibold text-holio-text">
                    {initials}
                  </div>
                )}
                <span className="text-xs font-semibold text-holio-text">
                  {channelName}
                </span>
                <span className="text-[11px] text-holio-muted">
                  {formatTimestamp(post.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-holio-text">
                {post.content}
              </p>
              <div className="mt-3 flex items-center gap-4 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1 text-holio-muted">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      {localMuted ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <button
            onClick={async () => {
              try {
                await api.post(`/chats/${chat.id}/unmute`)
                setLocalMuted(false)
              } catch { /* unmute failed */ }
            }}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-holio-orange text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
          >
            UNMUTE
          </button>
        </div>
      ) : (
        <div className="flex h-12 items-center justify-center border-t border-gray-100 bg-white">
          <span className="text-xs text-holio-muted">Subscribed to channel</span>
        </div>
      )}
    </div>
  )
}
