import { ChevronLeft, Search, Phone, Video, MoreVertical } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  initials: string
  avatarColor: string
  status: string
  isOnline: boolean
  isTyping?: boolean
  onBack?: () => void
  chatId?: string
  onPinClick?: () => void
}

export default function ChatHeader({
  name,
  avatarUrl,
  initials,
  avatarColor,
  status,
  isOnline,
  isTyping,
  onBack,
}: ChatHeaderProps) {
  const toggleInfoPanel = useUiStore((s) => s.toggleInfoPanel)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)

  return (
    <div className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 dark:bg-[#152022] dark:border-[#1E3035]">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-white/10 md:hidden"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={toggleInfoPanel}
          className="flex items-center gap-3 text-left"
        >
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
            )}
            {isOnline && (
              <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-tight text-holio-text dark:text-white">{name}</h3>
            {isTyping ? (
              <p className="text-[13px] font-medium text-green-500">typing...</p>
            ) : (
              <p className="text-[13px] text-holio-muted">{status}</p>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setShowInChatSearch(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-white/10"
          title="Search in chat"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-white/10"
          title="Voice call"
        >
          <Phone className="h-[18px] w-[18px]" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-white/10"
          title="Video call"
        >
          <Video className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={toggleInfoPanel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-white/10"
          title="More"
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  )
}
