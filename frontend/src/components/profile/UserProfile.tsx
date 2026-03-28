import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, Phone, MoreVertical, MessageCircle, QrCode, Bell, BellOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePresenceStore } from '../../stores/presenceStore'
import api from '../../services/api.service'
import type { User } from '../../types'

interface UserProfileProps { userId: string; onBack: () => void }
const MEDIA_TABS = ['Posts', 'Media', 'Files', 'Voice', 'Links', 'GIFs'] as const

function fmtLs(iso: string): string { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`; return new Date(iso).toLocaleDateString() }

export default function UserProfile({ userId, onBack }: UserProfileProps) {
  const isOnline = usePresenceStore((s) => s.isUserOnline)
  const lsMap = usePresenceStore((s) => s.lastSeen)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>('Media')
  const [notif, setNotif] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { let c = false; api.get<User>(`/users/${userId}`).then(({ data }) => { if (!c) setUser(data) }).catch(() => {}).finally(() => { if (!c) setLoading(false) }); return () => { c = true } }, [userId])
  const onScroll = useCallback(() => { if (ref.current) setScrolled(ref.current.scrollTop > 80) }, [])
  useEffect(() => { const el = ref.current; if (!el) return; el.addEventListener('scroll', onScroll, { passive: true }); return () => el.removeEventListener('scroll', onScroll) }, [onScroll])

  if (loading) return <div className="flex h-full items-center justify-center bg-white"><div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" /></div>
  if (!user) return <div className="flex h-full flex-col bg-white"><div className="flex h-14 items-center gap-3 border-b border-gray-100 px-4"><button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></button><span className="text-sm text-holio-muted">User not found</span></div></div>

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown'
  const ini = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const on = isOnline(user.id)
  const ls = lsMap[user.id]
  const st = on ? 'online' : ls ? `last seen ${fmtLs(ls)}` : 'last seen recently'

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-100 px-4">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></button>
        {scrolled ? (<div className="flex flex-1 items-center gap-3 transition-all duration-200">{user.avatarUrl ? <img src={user.avatarUrl} alt={name} className="h-9 w-9 rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-lavender/30 text-xs font-semibold text-holio-text">{ini}</div>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-holio-text">{name}</p><p className="text-xs text-holio-muted">{st}</p></div></div>) : <div className="flex-1" />}
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-50"><Phone className="h-5 w-5" /></button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-50"><MoreVertical className="h-5 w-5" /></button>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto">
        <div className={cn('flex flex-col items-center px-4 transition-all duration-200', scrolled ? 'h-0 overflow-hidden opacity-0 py-0' : 'py-6 opacity-100')}>
          <div className="relative">{user.avatarUrl ? <img src={user.avatarUrl} alt={name} className="h-[120px] w-[120px] rounded-full object-cover" /> : <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-holio-lavender/30 text-3xl font-bold text-holio-text">{ini}</div>}<div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange text-white"><MessageCircle className="h-5 w-5" /></div></div>
          <h2 className="mt-3 text-xl font-bold text-holio-text">{name}</h2>
          <p className="text-sm text-holio-muted">{st}</p>
        </div>
        <div className="divide-y divide-gray-100">
          {user.bio && <div className="px-4 py-3"><p className="text-xs text-holio-muted">Bio</p><p className="mt-0.5 text-sm text-holio-text">{user.bio}</p></div>}
          {user.username && <div className="flex items-center justify-between px-4 py-3"><div><p className="text-xs text-holio-muted">Username</p><p className="mt-0.5 text-sm text-holio-text">@{user.username}</p></div><button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-orange transition-colors hover:bg-holio-orange/10"><QrCode className="h-5 w-5" /></button></div>}
          <div className="flex items-center justify-between px-4 py-3"><div className="flex items-center gap-3">{notif ? <Bell className="h-5 w-5 text-holio-muted" /> : <BellOff className="h-5 w-5 text-holio-muted" />}<span className="text-sm text-holio-text">Notifications</span></div><button onClick={() => setNotif(!notif)} className={cn('relative h-6 w-11 rounded-full transition-colors', notif ? 'bg-holio-orange' : 'bg-gray-300')}><span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', notif ? 'translate-x-5' : 'translate-x-0')} /></button></div>
        </div>
        <div className="sticky top-0 z-10 bg-white"><div className="flex overflow-x-auto border-b border-gray-100 px-2">{MEDIA_TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn('flex-shrink-0 px-4 py-3 text-sm transition-colors', tab === t ? 'border-b-2 border-holio-orange font-medium text-holio-orange' : 'text-holio-muted hover:text-holio-text')}>{t}</button>)}</div></div>
        <div className="grid grid-cols-3 gap-0.5">{Array.from({ length: 9 }, (_, i) => <div key={i} className="aspect-square bg-gray-100"><div className="flex h-full w-full items-center justify-center text-xs text-holio-muted">{tab}</div></div>)}</div>
      </div>
    </div>
  )
}
