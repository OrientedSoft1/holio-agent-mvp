import { MessageSquare, Users, Settings, Bot } from 'lucide-react'
import { useUiStore, type NavItem } from '../../stores/uiStore'
import { useChatStore } from '../../stores/chatStore'
import { cn } from '../../lib/utils'

type BottomTab = {
  id: NavItem
  label: string
  icon: typeof MessageSquare
  activeIcon: typeof MessageSquare
}

const TABS: BottomTab[] = [
  { id: 'all', label: 'Chats', icon: MessageSquare, activeIcon: MessageSquare },
  { id: 'contacts', label: 'Contacts', icon: Users, activeIcon: Users },
  { id: 'bots', label: 'AI Agents', icon: Bot, activeIcon: Bot },
]

const SETTINGS_TAB = { id: 'settings' as const, label: 'Settings', icon: Settings }

export default function BottomNavBar() {
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const chats = useChatStore((s) => s.chats)

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)

  const handleTabPress = (id: NavItem | 'settings') => {
    if (id === 'settings') {
      window.location.href = '/settings'
      return
    }
    setActiveNavItem(id)
  }

  const isActive = (id: string) => activeNavItem === id

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => {
        const Icon = isActive(tab.id) ? tab.activeIcon : tab.icon
        const active = isActive(tab.id)
        const showBadge = tab.id === 'all' && totalUnread > 0

        return (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.id)}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 pb-4 pt-3"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <div className="relative">
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg px-4 py-1 transition-colors',
                  active && 'bg-holio-orange/15',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    active ? 'text-holio-orange' : 'text-gray-500',
                  )}
                  fill={active ? 'currentColor' : 'none'}
                  strokeWidth={active ? 1.5 : 2}
                />
              </div>
              {showBadge && (
                <span className="absolute -top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium leading-none text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium tracking-wide',
                active ? 'text-holio-orange' : 'text-gray-500',
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}

      <button
        onClick={() => handleTabPress('settings')}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 pb-4 pt-3"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-lg px-4 py-1',
          )}
        >
          <SETTINGS_TAB.icon
            className="h-6 w-6 text-gray-500 transition-colors"
            strokeWidth={2}
          />
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500">
          {SETTINGS_TAB.label}
        </span>
      </button>
    </nav>
  )
}
