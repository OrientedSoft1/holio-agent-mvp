import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Smartphone, Monitor, Tablet, QrCode, X, Globe, Trash2 } from 'lucide-react'

interface Session {
  id: string
  name: string
  icon: typeof Smartphone
  app: string
  location: string
  lastActive: string
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', name: 'Windows PC', icon: Monitor, app: 'Holio Desktop 2.1.0', location: 'Oslo, Norway', lastActive: 'Active now' },
  { id: '2', name: 'iPad Pro', icon: Tablet, app: 'Holio for iPad 1.4.2', location: 'Oslo, Norway', lastActive: '2 hours ago' },
  { id: '3', name: 'MacBook Air', icon: Monitor, app: 'Holio Desktop 2.0.8', location: 'Bergen, Norway', lastActive: 'Yesterday, 5:30 PM' },
]

export default function SettingsDevicesPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [showConfirm, setShowConfirm] = useState(false)

  const terminateSession = (id: string) => {
    setSessions((s) => s.filter((ses) => ses.id !== id))
  }

  const terminateAll = () => {
    setSessions([])
    setShowConfirm(false)
  }

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/settings')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Devices</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">This Device</p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9220]/10">
              <Smartphone className="h-5 w-5 text-[#FF9220]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-holio-text">iPhone 15 Pro</p>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Online</span>
              </div>
              <p className="text-xs text-holio-muted">Holio for iOS 2.3.0</p>
            </div>
          </div>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Link Desktop Device</p>
        <div className="mx-4 rounded-2xl bg-white p-5">
          <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
            <QrCode className="h-16 w-16 text-holio-muted/40" />
          </div>
          <p className="mb-4 text-center text-xs text-holio-muted">Scan the QR code from another device to link it to your account</p>
          <button className="w-full rounded-xl bg-[#FF9220] py-3 text-sm font-semibold text-white hover:bg-orange-500">
            Link Desktop Device
          </button>
        </div>

        {sessions.length > 0 && (
          <>
            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Active Sessions</p>
            <div className="mx-4 rounded-2xl bg-white">
              {sessions.map((ses, i) => {
                const Icon = ses.icon
                return (
                  <div key={ses.id}>
                    {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Icon className="h-5 w-5 text-holio-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-holio-text">{ses.name}</p>
                        <p className="text-xs text-holio-muted">{ses.app}</p>
                        <div className="flex items-center gap-1 text-xs text-holio-muted">
                          <Globe className="h-3 w-3" />
                          <span>{ses.location}</span>
                        </div>
                        <p className="text-xs text-holio-muted">{ses.lastActive}</p>
                      </div>
                      <button onClick={() => terminateSession(ses.id)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-red-50">
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mx-4 mt-4">
              <button onClick={() => setShowConfirm(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
                Terminate All Other Sessions
              </button>
            </div>
          </>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-2 text-base font-semibold text-holio-text">Terminate All Sessions?</h4>
            <p className="mb-5 text-sm text-holio-muted">All other devices will be logged out immediately.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-holio-text hover:bg-gray-200">Cancel</button>
              <button onClick={terminateAll} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600">Terminate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
