import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Search, Share2, X } from 'lucide-react'
import { useContactsStore, type Contact } from '../../stores/contactsStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { useChatStore } from '../../stores/chatStore'
import { cn } from '../../lib/utils'
import NewContactForm from '../contacts/NewContactForm'

interface ContactsPanelProps { onStartChat?: (userId: string) => void }

function dn(c: Contact): string { const u = c.contactUser; return c.nickname || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.phone }
function fls(iso: string): string { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`; return new Date(iso).toLocaleDateString() }

export default function ContactsPanel({ onStartChat }: ContactsPanelProps) {
  const contacts = useContactsStore((s) => s.contacts); const loading = useContactsStore((s) => s.loading); const fetch = useContactsStore((s) => s.fetchContacts)
  const createDM = useChatStore((s) => s.createDM); const isOn = usePresenceStore((s) => s.isUserOnline); const lsMap = usePresenceStore((s) => s.lastSeen)
  const [search, setSearch] = useState(''); const [showNew, setShowNew] = useState(false); const [scrolled, setScrolled] = useState(false); const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { const t = setTimeout(() => fetch(search || undefined), 300); return () => clearTimeout(t) }, [search, fetch])
  const onScroll = useCallback(() => { if (ref.current) setScrolled(ref.current.scrollTop > 40) }, [])
  useEffect(() => { const el = ref.current; if (!el) return; el.addEventListener('scroll', onScroll, { passive: true }); return () => el.removeEventListener('scroll', onScroll) }, [onScroll])
  const msg = async (ct: Contact) => { try { const ch = await createDM(ct.contactUserId); onStartChat?.(ch.id) } catch { /* */ } }

  const grouped = useMemo(() => {
    const s = [...contacts].sort((a, b) => dn(a).localeCompare(dn(b)))
    const r: { letter: string; items: Contact[] }[] = []
    for (const c of s) { const l = dn(c)[0]?.toUpperCase() || '#'; const last = r[r.length - 1]; if (last && last.letter === l) last.items.push(c); else r.push({ letter: l, items: [c] }) }
    return r
  }, [contacts])

  return (
    <div className="flex h-full flex-col bg-white">
      <div className={cn('flex-shrink-0 border-b border-gray-100 transition-all duration-200', scrolled ? 'px-4 py-2' : 'px-4 py-3')}><div className="flex items-center justify-between"><h2 className={cn('font-bold text-holio-text transition-all duration-200', scrolled ? 'text-base' : 'text-xl')}>Contacts</h2><button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"><Search className="h-4.5 w-4.5" /></button></div></div>
      <div className="sticky top-0 z-10 bg-white px-3 py-2"><div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5"><Search className="h-4 w-4 text-holio-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="flex-1 bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted" />{search && <button onClick={() => setSearch('')}><X className="h-3.5 w-3.5 text-holio-muted" /></button>}</div></div>
      <div ref={ref} className="flex-1 overflow-y-auto">
        <button className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50"><Share2 className="h-5 w-5 text-blue-500" /></div><span className="text-sm font-medium text-blue-500">Invite Friends</span></button>
        {loading && contacts.length === 0 && <div className="flex justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" /></div>}
        {!loading && contacts.length === 0 && <div className="px-4 py-8 text-center"><p className="text-sm text-holio-muted">{search ? `No contacts match "${search}"` : 'No contacts yet'}</p>{!search && <button onClick={() => setShowNew(true)} className="mt-2 text-sm font-medium text-holio-orange hover:underline">Add your first contact</button>}</div>}
        {grouped.map(({ letter, items }) => (<div key={letter}><div className="sticky top-0 z-[5] bg-gray-50 px-4 py-1"><span className="text-xs font-semibold text-holio-muted">{letter}</span></div>{items.map((ct) => { const u = ct.contactUser; const nm = dn(ct); const ini = nm.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(); const on = isOn(ct.contactUserId); const st = on ? 'online' : lsMap[ct.contactUserId] ? `last seen ${fls(lsMap[ct.contactUserId])}` : 'last seen recently'; return (<button key={ct.id} onClick={() => msg(ct)} className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"><div className="relative flex-shrink-0">{u.avatarUrl ? <img src={u.avatarUrl} alt={nm} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-holio-lavender/30 text-sm font-semibold text-holio-text">{ini}</div>}{on && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />}</div><div className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-medium text-holio-text">{nm}</p><p className="truncate text-xs text-holio-muted">{st}</p></div></button>) })}</div>))}
      </div>
      <NewContactForm open={showNew} onClose={() => setShowNew(false)} onCreated={() => fetch()} />
    </div>
  )
}
