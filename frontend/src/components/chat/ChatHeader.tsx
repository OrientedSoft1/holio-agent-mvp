import { ArrowLeft, Phone, MoreVertical, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../../stores/uiStore'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  initials: string
  avatarColor: string
  status: string
  isOnline: boolean
  onBack?: () => void
  userId?: string
  chatId?: string
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
  const navigate = useNavigate()
  const toggleInfoPanel = useUiStore((s) => s.toggleInfoPanel)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
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
              <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight text-holio-text">{name}</h3>
            <p className="text-xs text-[#8E8E93]">{status}</p>
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
