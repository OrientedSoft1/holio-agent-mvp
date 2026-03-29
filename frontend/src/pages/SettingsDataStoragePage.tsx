import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, HardDrive, Wifi, Signal, Globe, Trash2, Upload, Download } from 'lucide-react'
import { cn } from '../lib/utils'
import { useSettingsStore } from '../stores/settingsStore'

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}

export default function SettingsDataStoragePage() {
  const navigate = useNavigate()

  const dataStorage = useSettingsStore(s => s.dataStorage)
  const storageUsage = useSettingsStore(s => s.storageUsage)
  const networkStats = useSettingsStore(s => s.networkStats)
  const fetchDataStoragePrefs = useSettingsStore(s => s.fetchDataStoragePrefs)
  const updateDataStoragePrefs = useSettingsStore(s => s.updateDataStoragePrefs)
  const fetchStorageUsage = useSettingsStore(s => s.fetchStorageUsage)
  const fetchNetworkStats = useSettingsStore(s => s.fetchNetworkStats)
  const resetNetworkStats = useSettingsStore(s => s.resetNetworkStats)
  const clearCache = useSettingsStore(s => s.clearCache)

  useEffect(() => {
    fetchDataStoragePrefs()
    fetchStorageUsage()
    fetchNetworkStats()
  }, [fetchDataStoragePrefs, fetchStorageUsage, fetchNetworkStats])

  const usedGB = (storageUsage?.usedBytes ?? 0) / (1024 ** 3)
  const totalGB = (storageUsage?.totalBytes ?? 5 * 1024 ** 3) / (1024 ** 3)
  const pct = Math.round((usedGB / totalGB) * 100)

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/settings')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Data and Storage</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Storage Usage</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-holio-orange" />
              <span className="text-sm font-medium text-holio-text">{usedGB.toFixed(1)} GB of {totalGB.toFixed(1)} GB</span>
            </div>
            <span className="text-xs text-holio-muted">{pct}%</span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-full rounded-full bg-holio-orange transition-all" style={{ width: `${pct}%` }} />
          </div>
          <button onClick={clearCache} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </button>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Auto-Download Media</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <ToggleRow icon={Signal} label="Mobile Data" desc="Download media on cellular" value={dataStorage.mobileData} onChange={() => updateDataStoragePrefs({ mobileData: !dataStorage.mobileData })} />
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <ToggleRow icon={Wifi} label="Wi-Fi" desc="Download media on Wi-Fi" value={dataStorage.wifi} onChange={() => updateDataStoragePrefs({ wifi: !dataStorage.wifi })} />
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <ToggleRow icon={Globe} label="Roaming" desc="Download media while roaming" value={dataStorage.roaming} onChange={() => updateDataStoragePrefs({ roaming: !dataStorage.roaming })} />
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Media Upload Quality</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          {([
            { id: 'auto' as const, label: 'Automatic', desc: 'Balanced quality and speed' },
            { id: 'best' as const, label: 'Best Quality', desc: 'Larger file sizes' },
            { id: 'saver' as const, label: 'Data Saver', desc: 'Compressed media' },
          ]).map((opt) => (
            <button key={opt.id} onClick={() => updateDataStoragePrefs({ quality: opt.id })} className="flex w-full items-center gap-3 py-2.5">
              <div className={cn('flex h-5 w-5 items-center justify-center rounded-full border-2', dataStorage.quality === opt.id ? 'border-holio-orange' : 'border-gray-300 dark:border-gray-600')}>
                {dataStorage.quality === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-holio-orange" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-holio-text">{opt.label}</p>
                <p className="text-xs text-holio-muted">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Network Usage</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-holio-offwhite p-3 text-center">
              <Upload className="mx-auto mb-1 h-5 w-5 text-holio-orange" />
              <p className="text-lg font-bold text-holio-text">{formatBytes(networkStats?.sentBytes ?? 0)}</p>
              <p className="text-xs text-holio-muted">Sent</p>
            </div>
            <div className="rounded-xl bg-holio-offwhite p-3 text-center">
              <Download className="mx-auto mb-1 h-5 w-5 text-holio-lavender" />
              <p className="text-lg font-bold text-holio-text">{formatBytes(networkStats?.receivedBytes ?? 0)}</p>
              <p className="text-xs text-holio-muted">Received</p>
            </div>
          </div>
          <button onClick={resetNetworkStats} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-holio-muted hover:bg-gray-50 dark:hover:bg-gray-800">
            Reset Statistics
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }: { icon: typeof Signal; label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-[18px] w-[18px] text-holio-muted" />
        <div>
          <p className="text-sm font-medium text-holio-text">{label}</p>
          <p className="text-xs text-holio-muted">{desc}</p>
        </div>
      </div>
      <button onClick={onChange} className={cn('relative h-6 w-11 rounded-full', value ? 'bg-holio-orange' : 'bg-gray-300 dark:bg-gray-600')}>
        <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', value ? 'translate-x-5' : '')} />
      </button>
    </div>
  )
}
