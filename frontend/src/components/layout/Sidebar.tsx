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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CompanySwitcher from './CompanySwitcher'
import { useUiStore, type NavItem } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

const navItems: { id: NavItem; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid, badge: 12 },
  { id: 'personal', label: 'Personal', icon: User, badge: 3 },
  { id: 'company', label: 'Group', icon: Building2 },
  { id: 'channels', label: 'Channels', icon: Hash, badge: 4 },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'favorites', label: 'Favorite', icon: Star, badge: 2 },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'stories', label: 'Story', icon: CircleDot, badge: 4 },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)

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
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNavItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavItem(item.id)}
              className={cn(
                'relative flex h-[52px] w-[52px] flex-col items-center justify-center rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
            >
              <Icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="mt-0.5 text-[9px] font-medium leading-tight">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-holio-orange px-1 text-[9px] font-bold text-white">
                  {item.badge}
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
