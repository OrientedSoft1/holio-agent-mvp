import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Hash,
  Phone,
  MoreVertical,
  Eye,
  Share2,
  BellOff,
  LogOut,
} from 'lucide-react'
import DateSeparator from './DateSeparator'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

interface ChannelSubscriberViewProps {
  chatId: string
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

export default function ChannelSubscriberView({ chatId }: ChannelSubscriberViewProps) {
  const activeChat = useChatStore((s) => s.activeChat)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  if (!activeChat) return null

  const displayName = activeChat.name ?? 'Channel'
  const memberCount = (activeChat as any).members?.length ?? 0
  const dateGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Hash className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-holio-text">{displayName}</h3>
            <p className="text-xs text-holio-muted">{memberCount} subscribers</p>
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

      <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
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
              const imageUrl = msg.type === 'image' ? (msg.fileUrl ?? msg.metadata?.files?.[0]?.url) : null

              return (
                <div
                  key={msg.id}
                  className="mb-3 overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                        <Hash className="h-3 w-3 text-purple-600" />
                      </div>
                      <span className="text-xs font-semibold text-holio-text">{displayName}</span>
                      <span className="text-[11px] text-holio-muted">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-holio-text">{msg.content}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1 text-holio-muted">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-xs">{(msg.metadata as any)?.viewCount ?? 0}</span>
                      </div>
                      <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-t border-gray-100 bg-white p-3">
        <button className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 text-sm font-medium text-holio-text transition-colors hover:bg-gray-200">
          <BellOff className="h-4 w-4" />
          Mute
        </button>
        <button className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-medium text-red-500 transition-colors hover:bg-red-100">
          <LogOut className="h-4 w-4" />
          Leave
        </button>
      </div>
    </div>
  )
}
