import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Radar, MapPin, Users, User } from 'lucide-react'
import { cn } from '../lib/utils'

const DEMO_USERS = [
  { id: '1', name: 'Anders Berg', distance: '~200m away' },
  { id: '2', name: 'Ingrid Haugen', distance: '~500m away' },
  { id: '3', name: 'Lars Eriksen', distance: '~1.2km away' },
]

const DEMO_GROUPS = [
  { id: '1', name: 'Oslo Tech Meetup', members: 48, distance: '~300m' },
  { id: '2', name: 'Downtown Coffee Club', members: 15, distance: '~800m' },
]

export default function NearbyPeoplePage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">People Nearby</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mb-4 flex flex-col items-center rounded-2xl bg-white p-6">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF9220]/10">
            <Radar className="h-8 w-8 text-[#FF9220]" />
          </div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">Find People Nearby</h2>
          <p className="mt-1 text-center text-sm text-[#8E8E93]">Make yourself visible to discover and be discovered by people around you</p>
          <button
            onClick={() => setVisible(!visible)}
            className={cn('mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-colors', visible ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#FF9220] text-white hover:bg-orange-500')}
          >
            {visible ? 'Stop Sharing Location' : 'Make Myself Visible'}
          </button>
        </div>

        {visible && (
          <>
            <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">People Nearby</p>
            <div className="mx-4 rounded-2xl bg-white">
              {DEMO_USERS.map((u, i) => (
                <div key={u.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D1CBFB]/20">
                      <User className="h-5 w-5 text-[#D1CBFB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1A1A1A]">{u.name}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#8E8E93]" />
                        <span className="text-xs text-[#8E8E93]">{u.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">Nearby Groups</p>
            <div className="mx-4 rounded-2xl bg-white">
              {DEMO_GROUPS.map((g, i) => (
                <div key={g.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C6D5BA]/30">
                      <Users className="h-5 w-5 text-[#C6D5BA]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1A1A1A]">{g.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                        <span>{g.members} members</span>
                        <span>•</span>
                        <span>{g.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mx-4 mt-5 rounded-xl bg-[#D1CBFB]/10 p-4">
          <p className="text-xs text-[#8E8E93]">
            Your approximate distance is shared while visible. Exact location is never revealed to other users.
          </p>
        </div>
      </div>
    </div>
  )
}
