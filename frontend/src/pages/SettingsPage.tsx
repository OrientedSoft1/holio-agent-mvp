import { useEffect, useState } from 'react'
import { Shield, Bell, User as UserIcon, Eye, Phone, Image, Forward, BookOpen, Lock, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUiStore } from '../stores/uiStore'
import api from '../services/api.service'
import type { PrivacySettings } from '../types'

type PrivacyOption = 'everybody' | 'contacts' | 'nobody'

const PRIVACY_OPTIONS: { value: PrivacyOption; label: string }[] = [
  { value: 'everybody', label: 'Everybody' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'nobody', label: 'Nobody' },
]

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    lastSeen: 'everybody',
    phone: 'contacts',
    profilePhoto: 'everybody',
    forwarding: true,
    readReceipts: true,
  })
  const [privacySaving, setPrivacySaving] = useState(false)
  const [privacySaved, setPrivacySaved] = useState(false)

  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [showTwoFaDialog, setShowTwoFaDialog] = useState(false)
  const [twoFaPassword, setTwoFaPassword] = useState('')
  const [twoFaLoading, setTwoFaLoading] = useState(false)
  const [twoFaError, setTwoFaError] = useState('')

  useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      if (data.privacySettings) {
        setPrivacy({
          lastSeen: data.privacySettings.lastSeen ?? 'everybody',
          phone: data.privacySettings.phone ?? 'contacts',
          profilePhoto: data.privacySettings.profilePhoto ?? 'everybody',
          forwarding: data.privacySettings.forwarding ?? true,
          readReceipts: data.privacySettings.readReceipts ?? true,
        })
      }
      setTwoFaEnabled(!!data.twoFaHash)
    }).catch(() => {})
  }, [])

  const savePrivacy = async () => {
    setPrivacySaving(true)
    try {
      await api.patch('/users/me/privacy', privacy)
      setPrivacySaved(true)
      setTimeout(() => setPrivacySaved(false), 2000)
    } catch { /* ignore */ }
    setPrivacySaving(false)
  }

  const handleTwoFa = async () => {
    setTwoFaLoading(true)
    setTwoFaError('')
    try {
      if (twoFaEnabled) {
        await api.post('/users/me/2fa/disable', { password: twoFaPassword })
        setTwoFaEnabled(false)
      } else {
        await api.post('/users/me/2fa/enable', { password: twoFaPassword })
        setTwoFaEnabled(true)
      }
      setShowTwoFaDialog(false)
      setTwoFaPassword('')
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message ?? 'Failed')
    }
    setTwoFaLoading(false)
  }

  return (
    <div className="flex h-screen bg-holio-offwhite">
      <aside className="w-80 border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <h1 className="text-lg font-bold text-holio-text">HOLIO</h1>
        </div>
        <nav className="p-2">
          {[
            { icon: UserIcon, label: 'Profile', active: false },
            { icon: Shield, label: 'Privacy & Security', active: true },
            { icon: Bell, label: 'Notifications', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-holio-lavender/15 font-medium text-holio-text'
                  : 'text-holio-muted hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="mb-6 text-2xl font-bold text-holio-text">Settings</h2>

        {/* Profile Section */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-holio-text">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-holio-lavender/20">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-holio-lavender" />
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-holio-text">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'No name'}
              </p>
              {user?.username && (
                <p className="text-sm text-holio-muted">@{user.username}</p>
              )}
              <p className="text-sm text-holio-muted">{user?.phone}</p>
              {user?.bio && (
                <p className="mt-1 text-sm text-holio-text">{user.bio}</p>
              )}
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-holio-text">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4.5 w-4.5 text-holio-muted" /> : <Sun className="h-4.5 w-4.5 text-holio-muted" />}
              <div>
                <p className="text-sm font-medium text-holio-text">Dark Mode</p>
                <p className="text-xs text-holio-muted">Toggle between light and dark theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkMode ? 'bg-holio-orange' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-holio-text">Privacy</h3>
          <div className="space-y-5">
            <PrivacyDropdown
              icon={Eye}
              label="Last Seen"
              description="Who can see your last seen time"
              value={privacy.lastSeen}
              onChange={(v) => setPrivacy({ ...privacy, lastSeen: v })}
            />
            <PrivacyDropdown
              icon={Phone}
              label="Phone Number"
              description="Who can see your phone number"
              value={privacy.phone}
              onChange={(v) => setPrivacy({ ...privacy, phone: v })}
            />
            <PrivacyDropdown
              icon={Image}
              label="Profile Photo"
              description="Who can see your profile photo"
              value={privacy.profilePhoto}
              onChange={(v) => setPrivacy({ ...privacy, profilePhoto: v })}
            />
            <ToggleRow
              icon={Forward}
              label="Forwarded Messages"
              description="Link to your account when forwarding messages"
              checked={privacy.forwarding}
              onChange={(v) => setPrivacy({ ...privacy, forwarding: v })}
            />
            <ToggleRow
              icon={BookOpen}
              label="Read Receipts"
              description="Let others know when you've read their messages"
              checked={privacy.readReceipts}
              onChange={(v) => setPrivacy({ ...privacy, readReceipts: v })}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={savePrivacy}
              disabled={privacySaving}
              className="rounded-lg bg-holio-orange px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {privacySaving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
            {privacySaved && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
          </div>
        </section>

        {/* Two-Step Verification Section */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-holio-text">
            Two-Step Verification
          </h3>
          <p className="mb-4 text-sm text-holio-muted">
            Add an extra layer of security with a password that'll be required when logging
            in on a new device.
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${twoFaEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span className="text-sm text-holio-text">
              {twoFaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <button
            onClick={() => {
              setShowTwoFaDialog(true)
              setTwoFaPassword('')
              setTwoFaError('')
            }}
            className={`mt-4 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              twoFaEnabled
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-holio-orange px-5 py-2 text-white hover:bg-orange-600'
            }`}
          >
            {twoFaEnabled ? 'Disable' : 'Enable'}
          </button>
        </section>

        {/* 2FA Dialog */}
        {showTwoFaDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <Lock className="h-5 w-5 text-holio-orange" />
                <h4 className="text-base font-semibold text-holio-text">
                  {twoFaEnabled ? 'Disable' : 'Set'} Verification Password
                </h4>
              </div>
              <input
                type="password"
                value={twoFaPassword}
                onChange={(e) => setTwoFaPassword(e.target.value)}
                placeholder={twoFaEnabled ? 'Enter current password' : 'Create a password (min 6 chars)'}
                className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-orange"
                autoFocus
              />
              {twoFaError && (
                <p className="mb-3 text-xs text-red-500">{twoFaError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTwoFaDialog(false)}
                  className="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-holio-text transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTwoFa}
                  disabled={twoFaLoading || twoFaPassword.length < 6}
                  className="flex-1 rounded-lg bg-holio-orange py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {twoFaLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function PrivacyDropdown({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  value: PrivacyOption
  onChange: (value: PrivacyOption) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5 text-holio-muted" />
        <div>
          <p className="text-sm font-medium text-holio-text">{label}</p>
          <p className="text-xs text-holio-muted">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PrivacyOption)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-holio-text outline-none focus:border-holio-orange"
      >
        {PRIVACY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5 text-holio-muted" />
        <div>
          <p className="text-sm font-medium text-holio-text">{label}</p>
          <p className="text-xs text-holio-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-holio-orange' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
