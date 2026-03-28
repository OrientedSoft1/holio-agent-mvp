import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Phone,
  MoreVertical,
  MessageCircle,
  QrCode,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { usePresenceStore } from '../stores/presenceStore'
import api from '../services/api.service'
import type { User } from '../types'

type MediaTab = 'posts' | 'media' | 'files' | 'voice' | 'links' | 'gifs'

const MEDIA_TABS: { key: MediaTab; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'media', label: 'Media' },
  { key: 'files', label: 'Files' },
  { key: 'voice', label: 'Voice' },
  { key: 'links', label: 'Links' },
  { key: 'gifs', label: 'GIFs' },
]

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const isOnline = usePresenceStore((s) => userId ? s.onlineUsers.has(userId) : false)
  const lastSeen = usePresenceStore((s) => userId ? s.lastSeen[userId] : undefined)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<MediaTab>('media')
  const [notifications, setNotifications] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (!userId) return
    if (currentUser?.id === userId) {
      setUser(currentUser)
      setLoading(false)
      return
    }
    const fetchUser = async () => {
      try {
        const { data } = await api.get<User>(`/users/${userId}`)
        setUser(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId, currentUser])

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop)
    }
  }

  const statusText = isOnline
    ? 'online'
    : lastSeen
      ? `last seen ${new Date(lastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'last seen recently'

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-holio-offwhite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-holio-offwhite">
        <p className="text-holio-muted">User not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-holio-orange">
          Go back
        </button>
      </div>
    )
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100">
            <Phone className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="flex flex-col items-center px-4 pb-4 pt-8">
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="h-[120px] w-[120px] rounded-full object-cover"
              />
            ) : (
              <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-holio-lavender text-3xl font-bold text-white">
                {initials}
              </div>
            )}
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-holio-orange shadow-md">
              <MessageCircle className="h-4 w-4 text-white" />
            </button>
          </div>

          <h1 className="mt-4 text-[22px] font-bold text-holio-text">
            {user.firstName} {user.lastName ?? ''}
          </h1>
          <p className={cn('mt-1 text-sm', isOnline ? 'text-holio-orange' : 'text-holio-muted')}>
            {statusText}
          </p>
        </div>

        <div className="mx-4 rounded-2xl bg-white">
          {user.bio && (
            <>
              <div className="px-4 py-3">
                <p className="text-xs text-holio-muted">Bio</p>
                <p className="mt-1 text-sm text-holio-text">{user.bio}</p>
              </div>
              <div className="mx-4 h-px bg-gray-100" />
            </>
          )}

          {user.username && (
            <>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs text-holio-muted">Username</p>
                  <p className="mt-1 text-sm text-holio-text">@{user.username}</p>
                </div>
                <button className="text-holio-orange">
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
              <div className="mx-4 h-px bg-gray-100" />
            </>
          )}

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-holio-text">Notifications</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                notifications ? 'bg-holio-orange' : 'bg-gray-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  notifications && 'translate-x-5',
                )}
              />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
            {MEDIA_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 border-b-2 px-3 pb-2 pt-1.5 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-holio-orange text-holio-orange'
                    : 'border-transparent text-holio-muted hover:text-holio-text',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
