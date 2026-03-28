import { X, Bell, Image, File, Play, Link, ChevronRight, UserPlus, Pencil, Trash2, Ban } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import type { ChatItemData } from './ChatItem'

const MEDIA_STATS = [
  { label: 'Photos', count: 43, icon: Image },
  { label: 'Videos', count: 22, icon: Play },
  { label: 'Files', count: 54, icon: File },
  { label: 'Links', count: 18, icon: Link },
]

const ACTIONS = [
  { label: 'Add to group', icon: UserPlus, variant: 'default' as const },
  { label: 'Edit contact', icon: Pencil, variant: 'default' as const },
  { label: 'Block user', icon: Ban, variant: 'danger' as const },
  { label: 'Delete contact', icon: Trash2, variant: 'danger' as const },
]

interface InfoPanelProps {
  activeChat: ChatItemData | null
}

export default function InfoPanel({ activeChat }: InfoPanelProps) {
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)

  if (!activeChat) return null

  return (
    <div className="flex h-screen w-[300px] flex-shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <h3 className="text-sm font-semibold text-holio-text">
          {activeChat.isGroup || activeChat.isChannel ? 'Group Info' : 'Contact Info'}
        </h3>
        <button
          onClick={() => setShowInfoPanel(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-6">
          {activeChat.avatarUrl ? (
            <img
              src={activeChat.avatarUrl}
              alt={activeChat.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: activeChat.avatarColor }}
            >
              {activeChat.isChannel ? '#' : activeChat.initials}
            </div>
          )}
          <h4 className="mt-3 text-base font-semibold text-holio-text">
            {activeChat.name}
          </h4>
          <p className="text-xs text-holio-muted">
            {activeChat.isOnline ? 'online' : 'last seen recently'}
          </p>
        </div>

        <div className="space-y-1 border-t border-gray-100 px-4 py-3">
          <div className="py-1.5">
            <p className="text-xs text-holio-muted">Phone</p>
            <p className="text-sm text-holio-text">+1 (555) 123-4567</p>
          </div>
          <div className="py-1.5">
            <p className="text-xs text-holio-muted">Username</p>
            <p className="text-sm text-holio-text">@{activeChat.name.toLowerCase().replace(/\s/g, '')}</p>
          </div>
          <div className="py-1.5">
            <p className="text-xs text-holio-muted">Bio</p>
            <p className="text-sm text-holio-text">Product designer at Holio</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-holio-muted" />
            <span className="text-sm text-holio-text">Notifications</span>
          </div>
          <button
            className="h-6 w-10 rounded-full bg-holio-orange p-0.5 transition-colors"
            aria-label="Toggle notifications"
          >
            <div className="h-5 w-5 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
          </button>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <h5 className="mb-2 text-xs font-semibold tracking-wide text-holio-muted uppercase">
            Shared Media
          </h5>
          <div className="space-y-1">
            {MEDIA_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <button
                  key={stat.label}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-holio-muted" />
                    <span className="text-sm text-holio-text">
                      {stat.count} {stat.label}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-holio-muted" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50"
              >
                <Icon
                  className={`h-4 w-4 ${action.variant === 'danger' ? 'text-red-500' : 'text-holio-muted'}`}
                />
                <span
                  className={`text-sm ${action.variant === 'danger' ? 'text-red-500' : 'text-holio-text'}`}
                >
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
