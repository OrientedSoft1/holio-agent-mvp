import { ChevronLeft, Phone, MoreVertical, BellOff } from 'lucide-react'

interface GroupChatHeaderProps {
  name: string
  avatarUrl?: string | null
  avatarColor?: string
  memberCount: number
  onlineCount: number
  isMuted?: boolean
  onBack?: () => void
  onInfoClick?: () => void
}

export default function GroupChatHeader({
  name,
  avatarUrl,
  avatarColor = '#8b5cf6',
  memberCount,
  onlineCount,
  isMuted,
  onBack,
  onInfoClick,
}: GroupChatHeaderProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-[#fafafa] px-4">
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-100 md:hidden"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <button onClick={onInfoClick} className="flex items-center gap-3 text-left">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-lg font-medium text-holio-text">{name}</h3>
            {isMuted && <BellOff className="h-4 w-4 flex-shrink-0 text-holio-muted" />}
          </div>
          <p className="truncate text-sm text-holio-muted">
            {memberCount} Members{onlineCount > 0 && (
              <>, <span className="text-holio-orange">{onlineCount} online</span></>
            )}
          </p>
        </div>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
          <Phone className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
