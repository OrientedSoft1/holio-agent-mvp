import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, Users, Settings, Bot } from 'lucide-react'
import { useUiStore, type NavItem } from '../../stores/uiStore'
import { useChatStore } from '../../stores/chatStore'
import { cn } from '../../lib/utils'

type BottomTab = {
  id: NavItem | 'settings'
  label: string
  icon: typeof MessageCircle
  route?: string
}

const TABS: BottomTab[] = [
  { id: 'all', label: 'Chats', icon: MessageCircle },
  { id: 'contacts', label: 'Contacts', icon: Users, route: '/contacts' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
  { id: 'bots', label: 'AI Agents', icon: Bot, route: '/bots' },
]

export default function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const chats = useChatStore((s) => s.chats)

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)

  const isActive = (tab: BottomTab) => {
    if (tab.route) return location.pathname.startsWith(tab.route)
    return activeNavItem === tab.id && location.pathname === '/'
  }

  const handleTabPress = (tab: BottomTab) => {
    if (tab.route) {
      navigate(tab.route)
    } else {
      setActiveNavItem(tab.id as NavItem)
      navigate('/')
    }
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-gray-200 bg-white md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab)
        const Icon = tab.icon
        const showBadge = tab.id === 'all' && totalUnread > 0

        return (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab)}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2"
            style={{ minHeight: 44 }}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  active ? 'text-holio-orange' : 'text-[#8E8E93]',
                )}
                fill={active ? 'currentColor' : 'none'}
                strokeWidth={active ? 1.5 : 2}
              />
              {showBadge && (
                <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[11px] font-medium',
                active ? 'text-holio-orange' : 'text-[#8E8E93]',
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
