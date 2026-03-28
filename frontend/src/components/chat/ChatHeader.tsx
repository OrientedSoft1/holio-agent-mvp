import { Search, Phone, Pin, MoreVertical } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  initials: string
  avatarColor: string
  status: string
  isOnline: boolean
}

export default function ChatHeader({
  name,
  avatarUrl,
  initials,
  avatarColor,
  status,
  isOnline,
}: ChatHeaderProps) {
  const toggleInfoPanel = useUiStore((s) => s.toggleInfoPanel)
  const toggleInChatSearch = useUiStore((s) => s.toggleInChatSearch)

  return (
    <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
      <button
        onClick={toggleInfoPanel}
        className="flex items-center gap-3 text-left"
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          {isOnline && (
            <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-holio-text">{name}</h3>
          <p className="text-xs text-holio-muted">{status}</p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleInChatSearch}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <Search className="h-5 w-5" />
        </button>
        {[Phone, Pin, MoreVertical].map((Icon, i) => (
          <button
            key={i}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  )
}
