import { useState } from 'react'
import { BellOff, BadgeCheck, Pin, Archive, Eye } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePresenceStore } from '../../stores/presenceStore'
import { useChatStore } from '../../stores/chatStore'
import api from '../../services/api.service'
import type { Chat } from '../../types'

interface ChatItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

interface ChatWithExtras extends Chat {
  members?: { userId: string }[]
  currentUserId?: string
  verified?: boolean
}

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
  const displayName = isChannel ? `# ${chat.name ?? 'channel'}` : (chat.name ?? 'Chat')
  const initials = isChannel ? '#' : displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = { private: '#6366f1', group: '#059669', channel: '#8b5cf6', bot: '#FF9220' }
  return { displayName, initials, isChannel, isGroup, color: colorMap[chat.type] ?? '#6366f1' }
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const { displayName, initials, isChannel, isGroup, color } = getChatDisplay(chat)
  const ext = chat as ChatWithExtras
  const otherUserId = chat.type === 'private' && ext.members
    ? ext.members.find((m) => m.userId !== ext.currentUserId)?.userId
    : undefined
  const isOnline = usePresenceStore((s) => otherUserId ? s.onlineUsers.has(otherUserId) : false)
  const isDM = chat.type === 'private'
  const typingUsers = useChatStore((s) => s.typingUsers[chat.id] ?? [])
  const fetchChats = useChatStore((s) => s.fetchChats)
  const lastMsgText = chat.lastMessage?.content ?? ''
  const lastMsgTime = chat.lastMessage?.createdAt ?? chat.createdAt
  const senderPrefix = (isGroup || isChannel) && chat.lastMessage?.sender ? `${chat.lastMessage.sender.firstName}: ` : ''
  const isVerified = isChannel || !!ext.verified
  const thumbnailUrl = chat.lastMessage?.metadata?.files?.[0]?.url ?? null

  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleAction = async (action: string) => {
    setShowMenu(false)
    try {
      if (action === 'pin') await api.post(`/chats/${chat.id}/pin`)
      if (action === 'archive') await api.post(`/chats/${chat.id}/archive`)
      if (action === 'markUnread') await api.post(`/chats/${chat.id}/mark-unread`)
      fetchChats()
    } catch { /* ignore */ }
  }

  return (
    <>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
          isSelected ? 'bg-holio-lavender/30' : 'hover:bg-white/60',
        )}
      >
        <div className="relative flex-shrink-0">
          {chat.avatarUrl
            ? <img src={chat.avatarUrl} alt={displayName} className="h-[54px] w-[54px] rounded-full object-cover" />
            : <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full text-base font-semibold text-white" style={{ backgroundColor: color }}>{initials}</div>}
          {isDM && isOnline && <div className="absolute right-0.5 bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-holio-offwhite bg-green-500" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate text-[15px] font-semibold text-holio-text">{displayName}</span>
              {isVerified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />}
              {chat.muted && <BellOff className="h-3.5 w-3.5 flex-shrink-0 text-holio-muted" />}
              {chat.isPinned && <Pin className="h-3.5 w-3.5 flex-shrink-0 text-holio-muted" />}
            </div>
            <span className="ml-2 flex-shrink-0 text-xs text-holio-muted">{formatTimestamp(lastMsgTime)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-[13px] text-holio-muted">
              {typingUsers.length > 0 ? <span className="text-holio-orange">typing...</span> : <>{senderPrefix}{lastMsgText}</>}
            </p>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-8 w-8 rounded object-cover" />}
              {chat.unreadCount > 0 && (
                <span className={cn('flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white', chat.muted ? 'bg-gray-400' : 'bg-holio-orange')}>
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      <div className="ml-[82px] mr-4 h-px bg-gray-100" />

      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
            style={{ left: menuPos.x, top: menuPos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => handleAction('pin')} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-holio-text hover:bg-gray-50">
              <Pin className="h-4 w-4 text-holio-muted" />
              {chat.isPinned ? 'Unpin' : 'Pin to top'}
            </button>
            <button onClick={() => handleAction('archive')} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-holio-text hover:bg-gray-50">
              <Archive className="h-4 w-4 text-holio-muted" />
              Archive
            </button>
            <button onClick={() => handleAction('markUnread')} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-holio-text hover:bg-gray-50">
              <Eye className="h-4 w-4 text-holio-muted" />
              Mark as unread
            </button>
          </div>
        </div>
      )}
    </>
  )
}
