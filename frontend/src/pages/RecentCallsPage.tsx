import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video } from 'lucide-react'
import api from '../services/api.service'

interface CallEntry {
  id: string
  name: string
  type: 'incoming' | 'outgoing' | 'missed'
  callType: 'voice' | 'video'
  date: string
}

const TYPE_CONFIG = {
  incoming: { icon: PhoneIncoming, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40' },
  outgoing: { icon: PhoneOutgoing, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  missed: { icon: PhoneMissed, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40' },
} as const

export default function RecentCallsPage() {
  const navigate = useNavigate()
  const [calls, setCalls] = useState<CallEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const { data } = await api.get<CallEntry[]>('/calls')
        setCalls(data)
      } catch {
        setCalls([])
      } finally {
        setLoading(false)
      }
    }
    fetchCalls()
  }, [])

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/settings/account')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Recent Calls</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Phone className="mb-3 h-10 w-10 text-holio-muted" />
            <p className="text-sm text-holio-muted">No recent calls</p>
          </div>
        ) : (
          <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
            {calls.map((call, i) => {
              const config = TYPE_CONFIG[call.type]
              const Icon = config.icon
              return (
                <div key={call.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-holio-text">{call.name}</p>
                      <p className="text-xs text-holio-muted">
                        {call.callType === 'video' ? 'Video' : 'Voice'} call · {call.date}
                      </p>
                    </div>
                    <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      {call.callType === 'video' ? (
                        <Video className="h-4 w-4 text-holio-orange" />
                      ) : (
                        <Phone className="h-4 w-4 text-holio-orange" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mx-4 mt-4 rounded-2xl bg-holio-lavender/10 p-4">
          <p className="text-center text-sm text-holio-muted">Voice and video calls are coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  )
}
