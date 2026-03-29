import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useContactsStore, type Contact } from '../../stores/contactsStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { useChatStore } from '../../stores/chatStore'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onChatCreated: (chatId: string) => void
}

function displayName(c: Contact): string {
  const u = c.contactUser
  return c.nickname || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.phone
}

export default function NewChatModal({ open, onClose, onChatCreated }: NewChatModalProps) {
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const contacts = useContactsStore((s) => s.contacts)
  const loading = useContactsStore((s) => s.loading)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const createDM = useChatStore((s) => s.createDM)
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)

  useEffect(() => {
    if (open) {
      fetchContacts()
      setSearch('')
    }
  }, [open, fetchContacts])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchContacts(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, open, fetchContacts])

  const sorted = useMemo(() => {
    return [...contacts].sort((a, b) => displayName(a).localeCompare(displayName(b)))
  }, [contacts])

  const handleSelect = async (ct: Contact) => {
    if (creating) return
    setCreating(true)
    try {
      const chat = await createDM(ct.contactUserId)
      onChatCreated(chat.id)
      onClose()
    } catch {
      /* silent */
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-holio-text">New Chat</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-holio-muted" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <Search className="h-4 w-4 text-holio-muted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="flex-1 bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="h-3.5 w-3.5 text-holio-muted" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading && contacts.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
            </div>
          )}
          {!loading && contacts.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-holio-muted">
              {search ? `No contacts match "${search}"` : 'No contacts yet'}
            </p>
          )}
          {sorted.map((ct) => {
            const u = ct.contactUser
            const nm = displayName(ct)
            const initials = nm.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            const isOnline = !!onlineUsers[ct.contactUserId]

            return (
              <button
                key={ct.id}
                onClick={() => handleSelect(ct)}
                disabled={creating}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="relative flex-shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={nm} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-holio-lavender/30 text-xs font-semibold text-holio-text">
                      {initials}
                    </div>
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-holio-text">{nm}</p>
                  <p className="truncate text-xs text-holio-muted">
                    {isOnline ? 'online' : u.phone}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
