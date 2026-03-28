import { Pin, VolumeX } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ChatItemData {
  id: string
  name: string
  avatarUrl?: string | null
  initials: string
  avatarColor: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isOnline: boolean
  isGroup: boolean
  isChannel: boolean
}

interface ChatItemProps {
  chat: ChatItemData
  isSelected: boolean
  onClick: () => void
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-holio-lavender/30' : 'hover:bg-gray-50',
      )}
    >
      <div className="relative flex-shrink-0">
        {chat.avatarUrl ? (
          <img
            src={chat.avatarUrl}
            alt={chat.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: chat.avatarColor }}
          >
            {chat.isChannel ? '#' : chat.initials}
          </div>
        )}
        {chat.isOnline && !chat.isGroup && !chat.isChannel && (
          <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-holio-text">
            {chat.name}
          </span>
          <span className="ml-2 flex-shrink-0 text-xs text-holio-muted">
            {chat.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-holio-muted">
            {chat.lastMessage}
          </p>
          <div className="ml-2 flex flex-shrink-0 items-center gap-1">
            {chat.isPinned && (
              <Pin className="h-3 w-3 text-holio-muted" />
            )}
            {chat.isMuted && (
              <VolumeX className="h-3 w-3 text-holio-muted" />
            )}
            {chat.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-holio-orange px-1.5 text-[11px] font-medium text-white">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
