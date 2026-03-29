import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  CircleDot,
  Wallet,
  Phone,
  Monitor,
  FolderOpen,
  Bell,
  Lock,
  Database,
  Palette,
  QrCode,
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

import OtherAccountView from '../components/settings/OtherAccountView'

const QUICK_LINKS = [
  { icon: CircleDot, label: 'My Stories', route: '/story' },
  { icon: Wallet, label: 'Holio Credits', value: '0.00', route: '/holio-pro' },
]

const SETTINGS_MENU = [
  { icon: Phone, label: 'Recent Calls', route: '/calls' },
  { icon: Monitor, label: 'Devices', route: '/settings/devices' },
  { icon: FolderOpen, label: 'Chat Folders', route: '/settings/folders' },
  'separator' as const,
  { icon: Bell, label: 'Notifications and Sounds', route: '/settings/notifications' },
  { icon: Lock, label: 'Privacy and Security', route: '/settings' },
  { icon: Database, label: 'Data and Storage', route: '/settings/data-storage' },
  { icon: Palette, label: 'Appearance', route: '/settings/chat-appearance' },
]

type MenuItem = { icon: typeof Phone; label: string; route: string } | 'separator'

export default function SettingsAccountPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [otherAccountsOpen, setOtherAccountsOpen] = useState(false)

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'No name'

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-medium text-holio-text">Account</h1>
        <button
          onClick={() => navigate('/edit-profile')}
          className="text-sm font-medium text-holio-orange"
        >
          Edit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-holio-lavender/20">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-7 w-7 text-holio-lavender" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-holio-text">{name}</p>
              {user?.phone && (
                <p className="text-sm text-holio-muted">{user.phone}</p>
              )}
              {user?.username && (
                <p className="text-sm text-holio-muted">@{user.username}</p>
              )}
            </div>
            <button className="flex-shrink-0 p-1 text-holio-orange">
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Other Accounts */}
        <div className="mx-4 mt-3 rounded-2xl bg-white">
          <button
            onClick={() => setOtherAccountsOpen(!otherAccountsOpen)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium text-holio-text">
              Other Accounts
            </span>
            <ChevronRight
              className={cn(
                'h-4 w-4 text-holio-muted transition-transform',
                otherAccountsOpen && 'rotate-90',
              )}
            />
          </button>
          {otherAccountsOpen && (
            <div className="border-t border-gray-100 px-4 py-4">
              <OtherAccountView />
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mx-4 mt-3 rounded-2xl bg-white">
          {QUICK_LINKS.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={item.label}>
                {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                <button
                  onClick={() => item.route && navigate(item.route)}
                  className="flex w-full items-center gap-3 px-4 py-3"
                >
                  <Icon className="h-5 w-5 text-holio-muted" />
                  <span className="flex-1 text-left text-sm text-holio-text">
                    {item.label}
                  </span>
                  {item.value && (
                    <span className="text-sm font-medium text-holio-orange">
                      {item.value}
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Settings section label */}
        <p className="ml-4 mt-5 mb-1.5 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Settings
        </p>

        {/* Settings menu */}
        <div className="mx-4 rounded-2xl bg-white">
          {(SETTINGS_MENU as MenuItem[]).map((item, i) => {
            if (item === 'separator') {
              return (
                <div key={`sep-${i}`} className="mx-4 border-t border-gray-100" />
              )
            }
            const Icon = item.icon
            const prev = SETTINGS_MENU[i - 1]
            const showTopDivider = i > 0 && prev !== 'separator'
            return (
              <div key={item.label}>
                {showTopDivider && (
                  <div className="mx-4 border-t border-gray-100" />
                )}
                <button
                  onClick={() => navigate(item.route)}
                  className="flex w-full items-center gap-3 px-4 py-3"
                >
                  <Icon className="h-5 w-5 text-holio-muted" />
                  <span className="text-sm text-holio-text">{item.label}</span>
                </button>
              </div>
            )
          })}
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
