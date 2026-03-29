import { useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function OtherAccountView() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'No name'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl bg-holio-lavender/10 px-3 py-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-holio-lavender/20">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-holio-lavender">
              {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-holio-text">{name}</p>
        </div>
        <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300">Active</span>
      </div>

      <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-holio-orange hover:bg-holio-orange/5">
        <Plus className="h-4 w-4" />
        Add Another Account
      </button>

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  )
}
