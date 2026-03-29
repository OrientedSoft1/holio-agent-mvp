import { ArrowLeft, MoreVertical, Users } from 'lucide-react'

interface GroupChatHeaderProps {
  name: string
  avatarUrl?: string | null
  avatarColor?: string
  memberCount: number
  onlineCount: number
  onBack?: () => void
  onInfoClick?: () => void
  onMenuClick?: () => void
}

export default function GroupChatHeader({
  name,
  avatarUrl,
  avatarColor = '#8b5cf6',
  memberCount,
  onlineCount,
  onBack,
  onInfoClick,
  onMenuClick,
}: GroupChatHeaderProps) {
  return (
    <header className="flex h-[60px] flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      <button onClick={onInfoClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: avatarColor }}
            >
              <Users className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-holio-text">{name}</h3>
          <p className="truncate text-xs text-holio-muted">
            {memberCount} Members{onlineCount > 0 && (
              <>, <span className="text-holio-orange">{onlineCount} online</span></>
            )}
          </p>
        </div>
      </button>

      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
    </header>
  )
}
