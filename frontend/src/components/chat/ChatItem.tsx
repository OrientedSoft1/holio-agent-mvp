import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

interface ChatItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
}

function getChatDisplay(chat: Chat) {
  const isChannel = chat.type === 'channel'
  const isGroup = chat.type === 'group'
  const displayName = isChannel ? `# ${chat.name ?? 'channel'}` : chat.name ?? 'Chat'

  const initials = isChannel
    ? '#'
    : (displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase())

  const colorMap: Record<string, string> = {
    private: '#6366f1',
    group: '#059669',
    channel: '#8b5cf6',
    bot: '#FF9220',
  }

  return { displayName, initials, isChannel, isGroup, color: colorMap[chat.type] ?? '#6366f1' }
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const { displayName, initials, isChannel, isGroup, color } = getChatDisplay(chat)

  const lastMsgText = chat.lastMessage?.content ?? ''
  const lastMsgTime = chat.lastMessage?.createdAt ?? chat.createdAt
  const senderPrefix =
    (isGroup || isChannel) && chat.lastMessage?.sender
      ? `${chat.lastMessage.sender.firstName}: `
      : ''

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
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-holio-text">
            {displayName}
          </span>
          <span className="ml-2 flex-shrink-0 text-xs text-holio-muted">
            {formatTimestamp(lastMsgTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-holio-muted">
            {senderPrefix}{lastMsgText}
          </p>
          <div className="ml-2 flex flex-shrink-0 items-center gap-1">
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
