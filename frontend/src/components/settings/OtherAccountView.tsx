import { User as UserIcon, Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function OtherAccountView() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'No name'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
        <div className="relative flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-holio-lavender/20">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-holio-lavender" />
            )}
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-holio-orange" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-holio-text">{name}</p>
          {user?.phone && (
            <p className="text-xs text-holio-muted">{user.phone}</p>
          )}
        </div>
        <span className="rounded-full bg-holio-orange/10 px-2 py-0.5 text-[11px] font-semibold text-holio-orange">
          Active
        </span>
      </div>

      <button className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-gray-50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender/10">
          <Plus className="h-5 w-5 text-holio-lavender" />
        </div>
        <span className="text-sm font-medium text-holio-text">
          Add Another Account
        </span>
      </button>

      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-red-50"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
          <LogOut className="h-5 w-5 text-red-500" />
        </div>
        <span className="text-sm font-medium text-red-500">Log Out</span>
      </button>
    </div>
  )
}
