import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Radar, Eye, EyeOff, Users, MapPin, Loader2 } from 'lucide-react'
import api from '../services/api.service'

interface NearbyUser {
  id: string
  name: string
  distance: string
  avatar: string | null
}

export default function NearbyPeoplePage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible) {
      setNearbyUsers([])
      return
    }

    let cancelled = false

    const fetchNearby = async (lat?: number, lng?: number) => {
      setLoading(true)
      try {
        const { data } = await api.get<NearbyUser[]>('/users/nearby', {
          params: lat != null && lng != null ? { lat, lng } : undefined,
        })
        if (!cancelled) setNearbyUsers(data)
      } catch {
        if (!cancelled) setNearbyUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude),
        () => fetchNearby(),
      )
    } else {
      fetchNearby()
    }

    return () => { cancelled = true }
  }, [visible])

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/contacts')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">People Nearby</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-br from-holio-lavender/30 to-holio-lavender/10 p-6 text-center">
          <Radar className="mx-auto h-12 w-12 text-holio-orange" />
          <p className="mt-3 text-sm font-medium text-holio-text">Find people and groups near you</p>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Visibility</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          {visible ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-holio-text">You're Visible</p>
                <p className="text-xs text-holio-muted">Others nearby can see you</p>
              </div>
              <button onClick={() => setVisible(false)} className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-holio-text hover:bg-gray-200 dark:hover:bg-gray-700">
                <EyeOff className="h-4 w-4" />
                Stop
              </button>
            </div>
          ) : (
            <button onClick={() => setVisible(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 text-sm font-semibold text-white hover:bg-orange-500">
              <Eye className="h-4 w-4" />
              Make Myself Visible
            </button>
          )}
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">People Nearby</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          {visible ? (
            loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-holio-orange" />
              </div>
            ) : nearbyUsers.length > 0 ? (
              nearbyUsers.map((user, i) => (
                <div key={user.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-text">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-holio-text">{user.name}</p>
                      <p className="text-xs text-holio-muted">{user.distance}</p>
                    </div>
                    <MapPin className="h-4 w-4 flex-shrink-0 text-holio-muted" />
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-5 text-center text-sm text-holio-muted">No people found nearby</p>
            )
          ) : (
            <p className="px-4 py-5 text-center text-sm text-holio-muted">Enable visibility to see people nearby</p>
          )}
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Groups Nearby</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <Users className="h-8 w-8 text-holio-muted/40" />
            <p className="text-sm text-holio-muted">No groups found nearby</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950 p-4">
          <p className="text-xs text-amber-700 dark:text-amber-300">Your approximate location is shared while visibility is on. Turn it off at any time.</p>
        </div>
      </div>
    </div>
  )
}
