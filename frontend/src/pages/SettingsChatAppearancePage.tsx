import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sun, Moon, Type, CornerDownLeft, Mic } from 'lucide-react'
import { useUiStore } from '../stores/uiStore'
import { useSettingsStore } from '../stores/settingsStore'
import { cn } from '../lib/utils'

const BG_COLORS = [
  { id: 'white', label: 'White', value: '#FFFFFF' },
  { id: 'beige', label: 'Warm Beige', value: '#FDF6EC' },
  { id: 'blue', label: 'Light Blue', value: '#EBF4FA' },
  { id: 'green', label: 'Light Green', value: '#EFF6EB' },
  { id: 'lavender', label: 'Lavender', value: '#F0EDFA' },
  { id: 'rose', label: 'Rose', value: '#FAF0F0' },
]

export default function SettingsChatAppearancePage() {
  const navigate = useNavigate()
  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const appearance = useSettingsStore((s) => s.chatAppearance)
  const fetchChatAppearance = useSettingsStore((s) => s.fetchChatAppearance)
  const updateChatAppearance = useSettingsStore((s) => s.updateChatAppearance)

  useEffect(() => {
    fetchChatAppearance()
  }, [fetchChatAppearance])

  const selectedBg = BG_COLORS.find((c) => c.id === appearance.bgColor)?.value ?? '#FFFFFF'

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/settings')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Chat Appearance</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Theme</p>
        <div className="mx-4 flex gap-3 rounded-2xl bg-white dark:bg-gray-900 p-4">
          <button onClick={() => { if (darkMode) toggleDarkMode() }} className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors', !darkMode ? 'bg-holio-orange text-white' : 'bg-gray-100 dark:bg-gray-800 text-holio-text hover:bg-gray-200 dark:hover:bg-gray-700')}>
            <Sun className="h-4 w-4" /> Light
          </button>
          <button onClick={() => { if (!darkMode) toggleDarkMode() }} className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors', darkMode ? 'bg-holio-orange text-white' : 'bg-gray-100 dark:bg-gray-800 text-holio-text hover:bg-gray-200 dark:hover:bg-gray-700')}>
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Chat Background</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="mb-4 flex flex-wrap gap-3">
            {BG_COLORS.map((c) => (
              <button key={c.id} onClick={() => updateChatAppearance({ bgColor: c.id })} className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors', appearance.bgColor === c.id ? 'border-holio-orange' : 'border-gray-200 dark:border-gray-700')} style={{ backgroundColor: c.value }}>
                {appearance.bgColor === c.id && <svg className="h-4 w-4 text-holio-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700" style={{ backgroundColor: selectedBg }}>
            <div className="flex flex-col gap-2 p-4">
              <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-sm bg-holio-orange px-3 py-2">
                <p className="text-white" style={{ fontSize: `${appearance.textSize}px` }}>Hey! How are you?</p>
              </div>
              <div className="mr-auto max-w-[70%] rounded-2xl rounded-bl-sm bg-white dark:bg-gray-800 px-3 py-2 shadow-sm">
                <p className="text-holio-text" style={{ fontSize: `${appearance.textSize}px` }}>I'm doing great, thanks!</p>
              </div>
            </div>
          </div>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Text Size</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-3">
            <Type className="h-3.5 w-3.5 text-holio-muted" />
            <input type="range" min={12} max={20} value={appearance.textSize} onChange={(e) => updateChatAppearance({ textSize: Number(e.target.value) })} className="flex-1 accent-holio-orange" />
            <Type className="h-5 w-5 text-holio-muted" />
          </div>
          <p className="mt-2 text-center text-sm text-holio-muted">{appearance.textSize}px</p>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Other</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <CornerDownLeft className="h-[18px] w-[18px] text-holio-muted" />
              <span className="text-sm text-holio-text">Send by Enter</span>
            </div>
            <button onClick={() => updateChatAppearance({ sendByEnter: !appearance.sendByEnter })} className={cn('relative h-6 w-11 rounded-full', appearance.sendByEnter ? 'bg-holio-orange' : 'bg-gray-300 dark:bg-gray-600')}>
              <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', appearance.sendByEnter ? 'translate-x-5' : '')} />
            </button>
          </div>
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Mic className="h-[18px] w-[18px] text-holio-muted" />
              <span className="text-sm text-holio-text">Raise to Listen</span>
            </div>
            <button onClick={() => updateChatAppearance({ raiseToListen: !appearance.raiseToListen })} className={cn('relative h-6 w-11 rounded-full', appearance.raiseToListen ? 'bg-holio-orange' : 'bg-gray-300 dark:bg-gray-600')}>
              <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', appearance.raiseToListen ? 'translate-x-5' : '')} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
