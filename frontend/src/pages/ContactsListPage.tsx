import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, UserPlus, Users, Plus, X, ShieldBan } from 'lucide-react'
import { useContactsStore, type Contact } from '../stores/contactsStore'
import { usePresenceStore } from '../stores/presenceStore'
import { cn } from '../lib/utils'

const actionItems = [
  { icon: MapPin, label: 'Find People Nearby', route: '/nearby' },
  { icon: UserPlus, label: 'Invite Friends', route: '/invite-friends' },
  { icon: Users, label: 'Contact Categories' },
  { icon: Plus, label: 'Add New Contact', route: '/contacts/new' },
  { icon: ShieldBan, label: 'Blocked Contacts', route: '/contacts/blocked' },
]

function formatLastSeen(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getInitials(firstName: string, lastName: string | null) {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

function groupByLetter(contacts: Contact[]) {
  const sorted = [...contacts].sort((a, b) =>
    a.contactUser.firstName.localeCompare(b.contactUser.firstName),
  )

  const groups: Record<string, Contact[]> = {}
  for (const contact of sorted) {
    const letter = contact.contactUser.firstName.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(contact)
  }

  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export default function ContactsListPage() {
  const navigate = useNavigate()
  const contacts = useContactsStore((s) => s.contacts)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)
  const lastSeen = usePresenceStore((s) => s.lastSeen)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrolled(el.scrollTop > 60)
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts
    const q = query.toLowerCase()
    return contacts.filter((c) => {
      const full = `${c.contactUser.firstName} ${c.contactUser.lastName ?? ''}`.toLowerCase()
      return full.includes(q) || c.contactUser.username?.toLowerCase().includes(q)
    })
  }, [contacts, query])

  const grouped = useMemo(() => groupByLetter(filtered), [filtered])

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 transition-all duration-200',
          scrolled
            ? 'border-b border-gray-100 py-2 shadow-sm'
            : 'pt-4 pb-2',
        )}
      >
        <h1
          className={cn(
            'font-bold text-holio-text transition-all duration-200',
            scrolled ? 'text-base' : 'text-[22px]',
          )}
        >
          Contacts
        </h1>
        <button
          type="button"
          onClick={() => {
            setSearchOpen((o) => !o)
            if (searchOpen) setQuery('')
          }}
          className="rounded-full p-2 transition-colors hover:bg-black/5"
        >
          {searchOpen ? (
            <X className="h-5 w-5 text-holio-muted" />
          ) : (
            <Search className="h-5 w-5 text-holio-muted" />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div
        className={cn(
          'overflow-hidden px-4 transition-all duration-200',
          searchOpen ? 'max-h-14 pb-2 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-holio-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted"
            autoFocus={searchOpen}
          />
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {/* Action items */}
        <div className="px-4 pt-1 pb-2">
          {actionItems.map(({ icon: Icon, label, route }) => (
            <button
              key={label}
              type="button"
              onClick={() => route && navigate(route)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-black/5"
            >
              <Icon className="h-5 w-5 text-holio-orange" />
              <span className="text-[15px] font-medium text-holio-orange">{label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-black/8" />

        {/* Contact list */}
        <div className="px-4 pt-2 pb-4">
          {grouped.map(([letter, group]) => (
            <div key={letter}>
              <p className="px-2 pt-3 pb-1 text-xs font-semibold text-holio-muted">{letter}</p>
              {group.map((contact) => {
                const user = contact.contactUser
                const displayName = user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName
                const isOnline = !!onlineUsers[user.id]
                const userLastSeen = lastSeen[user.id]

                return (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/5"
                  >
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={displayName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-holio-lavender">
                          <span className="text-sm font-semibold text-holio-text">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                      )}
                      {isOnline && (
                        <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-holio-offwhite bg-green-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-holio-text">
                        {displayName}
                      </p>
                      {isOnline ? (
                        <p className="text-xs text-green-500">online</p>
                      ) : userLastSeen ? (
                        <p className="text-xs text-holio-muted">
                          last seen {formatLastSeen(userLastSeen)}
                        </p>
                      ) : (
                        <p className="text-xs text-holio-muted">last seen recently</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-holio-muted">
              {query.trim() ? 'No contacts found' : 'No contacts yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
