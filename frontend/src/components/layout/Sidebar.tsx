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
import CompanySwitcher from './CompanySwitcher'
import { useUiStore, type NavItem } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

const navItems: { id: NavItem; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid, badge: 12 },
  { id: 'personal', label: 'Personal', icon: User, badge: 3 },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'stories', label: 'Stories', icon: CircleDot },
]

export default function Sidebar() {
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)

  return (
    <aside className="flex h-screen w-[70px] flex-shrink-0 flex-col bg-holio-dark">
      <div className="py-4 text-center">
        <span className="text-sm font-black tracking-widest text-white">
          HOLIO
        </span>
      </div>

      <CompanySwitcher />

      <div className="mx-3 my-1 h-px bg-white/10" />

      <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto px-1.5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNavItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavItem(item.id)}
              className={cn(
                'relative flex h-12 w-12 flex-col items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 text-[10px] leading-tight">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-holio-orange px-1 text-[10px] font-medium text-white">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 pb-4">
        <button
          onClick={toggleDarkMode}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white/60 transition-colors hover:text-white"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl text-white/60 transition-colors hover:text-white">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}
