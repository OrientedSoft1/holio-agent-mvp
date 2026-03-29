import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import { useSettingsStore } from '../stores/settingsStore'

const SOUNDS = ['Default', 'Ding', 'Note', 'Chime', 'Bell', 'None']

export default function SettingsNotificationsPage() {
  const navigate = useNavigate()
  const notifs = useSettingsStore((s) => s.notifications)
  const fetchNotificationSettings = useSettingsStore((s) => s.fetchNotificationSettings)
  const updateNotificationSettings = useSettingsStore((s) => s.updateNotificationSettings)

  useEffect(() => { fetchNotificationSettings() }, [fetchNotificationSettings])

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/settings')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel>Message Notifications</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <SettingRow label="Alerts"><Toggle value={notifs.msgAlert} onChange={(v) => updateNotificationSettings({ msgAlert: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Message Preview"><Toggle value={notifs.msgPreview} onChange={(v) => updateNotificationSettings({ msgPreview: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Sound"><SoundSelect value={notifs.msgSound} onChange={(v) => updateNotificationSettings({ msgSound: v })} /></SettingRow>
        </div>

        <SectionLabel>Group Notifications</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <SettingRow label="Alerts"><Toggle value={notifs.grpAlert} onChange={(v) => updateNotificationSettings({ grpAlert: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Message Preview"><Toggle value={notifs.grpPreview} onChange={(v) => updateNotificationSettings({ grpPreview: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Sound"><SoundSelect value={notifs.grpSound} onChange={(v) => updateNotificationSettings({ grpSound: v })} /></SettingRow>
        </div>

        <SectionLabel>In-App Notifications</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <SettingRow label="Sounds"><Toggle value={notifs.inAppSounds} onChange={(v) => updateNotificationSettings({ inAppSounds: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Vibrate"><Toggle value={notifs.inAppVibrate} onChange={(v) => updateNotificationSettings({ inAppVibrate: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Message Preview"><Toggle value={notifs.inAppPreview} onChange={(v) => updateNotificationSettings({ inAppPreview: v })} /></SettingRow>
        </div>

        <SectionLabel>Other</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <SettingRow label="Contact Joined Holio"><Toggle value={notifs.contactJoined} onChange={(v) => updateNotificationSettings({ contactJoined: v })} /></SettingRow>
          <Divider />
          <SettingRow label="Pinned Messages"><Toggle value={notifs.pinnedMessages} onChange={(v) => updateNotificationSettings({ pinnedMessages: v })} /></SettingRow>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">{children}</p>
}

function Divider() {
  return <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-holio-text">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={cn('relative h-6 w-11 rounded-full', value ? 'bg-holio-orange' : 'bg-gray-300 dark:bg-gray-600')}>
      <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', value ? 'translate-x-5' : '')} />
    </button>
  )
}

function SoundSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-holio-text dark:text-holio-text outline-none focus:border-holio-orange">
      {SOUNDS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}
