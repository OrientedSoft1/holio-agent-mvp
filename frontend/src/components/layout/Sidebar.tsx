import {
  LayoutGrid,
  User,
  Building2,
  Hash,
  Bot,
  Star,
  CircleDot,
  Settings,
  Moon,
  Sun,
  Users,
  BrainCircuit,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import CompanySwitcher from './CompanySwitcher'
import { useUiStore, type NavItem } from '../../stores/uiStore'
import { useChatStore } from '../../stores/chatStore'
import { useStoryStore } from '../../stores/storyStore'
import { cn } from '../../lib/utils'

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'company', label: 'Group', icon: Building2 },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'ai', label: 'AI', icon: BrainCircuit },
  { id: 'favorites', label: 'Favorite', icon: Star },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'stories', label: 'Story', icon: CircleDot },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const chats = useChatStore((s) => s.chats)
  const storyGroups = useStoryStore((s) => s.storyGroups)

  const badges = useMemo(() => {
    const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    const personalUnread = chats
      .filter((c) => c.type === 'private')
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    const channelUnread = chats
      .filter((c) => c.type === 'channel')
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    const favUnread = chats
      .filter((c) => c.isFavourite)
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    const unviewedStories = storyGroups.filter(
      (g) => g.stories.some((s) => !s.viewed),
    ).length

    return {
      all: totalUnread || undefined,
      personal: personalUnread || undefined,
      channels: channelUnread || undefined,
      favorites: favUnread || undefined,
      stories: unviewedStories || undefined,
    } as Record<string, number | undefined>
  }, [chats, storyGroups])

  return (
    <aside className="flex h-screen w-[72px] flex-shrink-0 flex-col bg-holio-dark">
      <div className="py-4 text-center">
        <span className="text-[11px] font-black tracking-[0.2em] text-white">
          HOLIO
        </span>
      </div>

      <CompanySwitcher />

      <div className="mx-3 my-1 h-px bg-white/10" />

      <nav className="flex flex-1 flex-col items-center gap-0.5 overflow-y-auto scrollbar-hide px-1.5 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeNavItem === item.id
          const badge = badges[item.id]
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveNavItem(item.id)
                navigate(item.id === 'ai' ? '/ai/playground' : '/chat')
              }}
              className={cn(
                'relative flex h-[52px] w-[52px] flex-col items-center justify-center rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
            >
              <Icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="mt-0.5 text-[9px] font-medium leading-tight">{item.label}</span>
              {badge && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-holio-orange px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-0.5 pb-4">
        <button
          onClick={toggleDarkMode}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun className="h-[20px] w-[20px]" /> : <Moon className="h-[20px] w-[20px]" />}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          <Settings className="h-[20px] w-[20px]" />
        </button>
      </div>
    </aside>
  )
}
