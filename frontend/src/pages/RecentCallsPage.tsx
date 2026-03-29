import { useNavigate } from 'react-router-dom'
import { ChevronLeft, PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone, Video } from 'lucide-react'
import { cn } from '../lib/utils'

const DEMO_CALLS = [
  { id: 1, name: 'Alice Johnson', type: 'incoming' as const, callType: 'voice' as const, date: 'Today, 2:30 PM', duration: '5:23' },
  { id: 2, name: 'Bob Smith', type: 'outgoing' as const, callType: 'video' as const, date: 'Today, 11:15 AM', duration: '12:45' },
  { id: 3, name: 'Carol Williams', type: 'missed' as const, callType: 'voice' as const, date: 'Yesterday, 6:00 PM', duration: '' },
  { id: 4, name: 'David Brown', type: 'incoming' as const, callType: 'voice' as const, date: 'Yesterday, 3:20 PM', duration: '1:02' },
  { id: 5, name: 'Emma Davis', type: 'outgoing' as const, callType: 'video' as const, date: 'Mar 27, 9:00 AM', duration: '23:10' },
  { id: 6, name: 'Frank Miller', type: 'missed' as const, callType: 'voice' as const, date: 'Mar 26, 4:45 PM', duration: '' },
]

const ICONS = { incoming: PhoneIncoming, outgoing: PhoneOutgoing, missed: PhoneMissed }
const COLORS = { incoming: 'text-green-500', outgoing: 'text-blue-500', missed: 'text-red-500' }
const LABELS = { incoming: 'Incoming', outgoing: 'Outgoing', missed: 'Missed' }

export default function RecentCallsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Recent Calls</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 rounded-2xl bg-white">
          {DEMO_CALLS.map((call, i) => {
            const DirIcon = ICONS[call.type]
            const initials = call.name.split(' ').map((w) => w[0]).join('')
            return (
              <div key={call.id}>
                {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D1CBFB]/20">
                    <span className="text-sm font-semibold text-[#D1CBFB]">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', call.type === 'missed' ? 'text-red-500' : 'text-[#1A1A1A]')}>{call.name}</p>
                    <div className="flex items-center gap-1.5">
                      <DirIcon className={cn('h-3 w-3', COLORS[call.type])} />
                      <span className="text-xs text-[#8E8E93]">
                        {LABELS[call.type]}{call.duration ? ` • ${call.duration}` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E93]">{call.date}</p>
                  </div>
                  <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100">
                    {call.callType === 'video' ? <Video className="h-4.5 w-4.5 text-[#FF9220]" /> : <Phone className="h-4.5 w-4.5 text-[#FF9220]" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 px-4 text-center text-xs text-[#8E8E93]">
          Voice &amp; video calling is coming soon.
        </p>
      </div>
    </div>
  )
}
