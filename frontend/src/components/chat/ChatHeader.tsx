import { ChevronLeft, Phone, MoreVertical } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  initials: string
  avatarColor: string
  status: string
  isOnline: boolean
  onBack?: () => void
}

export default function ChatHeader({
  name,
  avatarUrl,
  initials,
  avatarColor,
  status,
  isOnline,
  onBack,
}: ChatHeaderProps) {
  const toggleInfoPanel = useUiStore((s) => s.toggleInfoPanel)

  return (
    <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[#fafafa] px-3">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text md:hidden"
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
            {isOnline && (
              <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#fafafa] bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium leading-tight text-holio-text">{name}</h3>
            <p className="text-sm text-holio-muted">{status}</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
