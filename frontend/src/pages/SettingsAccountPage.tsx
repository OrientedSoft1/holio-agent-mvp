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

interface QuickLink {
  icon: typeof Phone
  label: string
  value?: string
  route: string
}

interface SettingsItem {
  icon: typeof Phone
  label: string
  route: string
}

const QUICK_LINKS: QuickLink[] = [
  { icon: CircleDot, label: 'My Stories', route: '/stories' },
  { icon: Wallet, label: 'Holio Credits', value: '0.00', route: '/credits' },
]

const SETTINGS_GROUP_1: SettingsItem[] = [
  { icon: Phone, label: 'Recent Calls', route: '/calls' },
  { icon: Monitor, label: 'Devices', route: '/settings/devices' },
  { icon: FolderOpen, label: 'Chat Folders', route: '/settings/folders' },
]

const SETTINGS_GROUP_2: SettingsItem[] = [
  { icon: Bell, label: 'Notifications and Sounds', route: '/settings/notifications' },
  { icon: Lock, label: 'Privacy and Security', route: '/settings' },
  { icon: Database, label: 'Data and Storage', route: '/settings/data-storage' },
  { icon: Palette, label: 'Appearance', route: '/settings/chat-appearance' },
]

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Phone
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 text-holio-muted" />
      <span className="flex-1 text-left text-sm text-holio-text">{label}</span>
      {value && (
        <span className="text-sm font-medium text-holio-orange">{value}</span>
      )}
      <ChevronRight className="h-4 w-4 text-holio-muted" />
    </button>
  )
}

function SettingsGroup({ items }: { items: SettingsItem[] }) {
  const navigate = useNavigate()

  return (
    <div className="mx-4 rounded-2xl bg-white">
      {items.map((item, i) => (
        <div key={item.label}>
          {i > 0 && <div className="mx-4 border-t border-gray-100" />}
          <SettingsRow
            icon={item.icon}
            label={item.label}
            onClick={() => navigate(item.route)}
          />
        </div>
      ))}
    </div>
  )
}

export default function SettingsAccountPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [otherAccountsOpen, setOtherAccountsOpen] = useState(false)

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'No name'

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-holio-text">Account</h1>
        <button
          onClick={() => navigate('/edit-profile')}
          className="text-sm font-medium text-holio-orange"
        >
          Edit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
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

        <div className="mx-4 mt-3 rounded-2xl bg-white">
          <button
            onClick={() => setOtherAccountsOpen((v) => !v)}
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
            <div className="border-t border-gray-100 px-4 py-3">
              <OtherAccountView />
            </div>
          )}
        </div>

        <div className="mx-4 mt-3 rounded-2xl bg-white">
          {QUICK_LINKS.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div className="mx-4 border-t border-gray-100" />}
              <SettingsRow
                icon={item.icon}
                label={item.label}
                value={item.value}
                onClick={() => navigate(item.route)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <SettingsGroup items={SETTINGS_GROUP_1} />
        </div>

        <div className="mt-3">
          <SettingsGroup items={SETTINGS_GROUP_2} />
        </div>
      </div>
    </div>
  )
}
