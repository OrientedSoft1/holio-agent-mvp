import { BellOff, BadgeCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePresenceStore } from '../../stores/presenceStore'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import type { Chat } from '../../types'

interface ChatItemProps { chat: Chat; isSelected: boolean; onClick: () => void }

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const diffDays = Math.floor((new Date().getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
}

function getChatDisplay(chat: Chat) {
  const isChannel = chat.type === 'channel'
  const isGroup = chat.type === 'group'
  const displayName = isChannel ? `# ${chat.name ?? 'channel'}` : chat.name ?? 'Chat'
  const initials = isChannel ? '#' : displayName.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = { private: '#6366f1', group: '#059669', channel: '#8b5cf6', bot: '#FF9220' }
  return { displayName, initials, isChannel, isGroup, color: colorMap[chat.type] ?? '#6366f1' }
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const { displayName, initials, isChannel, isGroup, color } = getChatDisplay(chat)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const members = chat.members
  const otherUserId = chat.type === 'private' && members ? members.find((m) => m.userId !== currentUserId)?.userId : undefined
  const isOnline = usePresenceStore((s) => otherUserId ? !!s.onlineUsers[otherUserId] : false)
  const isDM = chat.type === 'private'
  const typingUsers = useChatStore((s) => s.typingUsers[chat.id])
  const typingCount = typingUsers?.length ?? 0
  const lastMsgText = chat.lastMessage?.content ?? ''
  const lastMsgTime = chat.lastMessage?.createdAt ?? chat.createdAt
  const senderPrefix = (isGroup || isChannel) && chat.lastMessage?.sender ? `${chat.lastMessage.sender.firstName}: ` : ''
  const isVerified = isChannel || chat.verified

  return (
    <>
      <button onClick={onClick} className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors', isSelected ? 'bg-holio-lavender/30' : 'hover:bg-gray-50')}>
        <div className="relative flex-shrink-0">
          {chat.avatarUrl
            ? <img src={chat.avatarUrl} alt={displayName} className="h-[54px] w-[54px] rounded-full object-cover" />
            : <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full text-base font-semibold text-white" style={{ backgroundColor: color }}>{initials}</div>}
          {isDM && isOnline && <div className="absolute right-0.5 bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate text-[15px] font-semibold text-holio-text">{displayName}</span>
              {isVerified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />}
              {chat.muted && <BellOff className="h-3.5 w-3.5 flex-shrink-0 text-holio-muted" />}
            </div>
            <span className="ml-2 flex-shrink-0 text-xs text-holio-muted">{formatTimestamp(lastMsgTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="truncate text-[13px] text-holio-muted">
              {typingCount > 0 ? <span className="text-holio-orange">typing...</span> : <>{senderPrefix}{lastMsgText}</>}
            </p>
            {chat.unreadCount > 0 && (
              <span className={cn('ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white', chat.muted ? 'bg-gray-400' : 'bg-holio-orange')}>{chat.unreadCount}</span>
            )}
          </div>
        </div>
      </button>
      <div className="ml-[70px] h-px bg-gray-100" />
    </>
  )
}
