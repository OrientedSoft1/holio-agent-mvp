import { useEffect, useState } from 'react'
import { Search, UserPlus, Star, MessageSquare, Ban, Trash2, X } from 'lucide-react'
import { useContactsStore, type Contact } from '../../stores/contactsStore'
import { useChatStore } from '../../stores/chatStore'
import { cn } from '../../lib/utils'

interface ContactsPanelProps {
  onStartChat?: (userId: string) => void
}

export default function ContactsPanel({ onStartChat }: ContactsPanelProps) {
  const contacts = useContactsStore((s) => s.contacts)
  const loading = useContactsStore((s) => s.loading)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const removeContact = useContactsStore((s) => s.removeContact)
  const toggleFavorite = useContactsStore((s) => s.toggleFavorite)
  const blockUser = useContactsStore((s) => s.blockUser)
  const createDM = useChatStore((s) => s.createDM)

  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts(search || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchContacts])

  const handleMessage = async (contact: Contact) => {
    try {
      const chat = await createDM(contact.contactUserId)
      onStartChat?.(chat.id)
    } catch {
      // ignore
    }
  }

  const favorites = contacts.filter((c) => c.isFavorite)
  const regular = contacts.filter((c) => !c.isFavorite)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-bold text-holio-text">Contacts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <UserPlus className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Search className="h-4 w-4 text-holio-muted" />
          <input
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

      <div className="flex-1 overflow-y-auto">
        {loading && contacts.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-holio-muted">
              {search ? `No contacts match "${search}"` : 'No contacts yet'}
            </p>
            {!search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-sm font-medium text-holio-orange hover:underline"
              >
                Add your first contact
              </button>
            )}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="px-3 pb-1">
            <p className="px-1 py-1.5 text-[11px] font-semibold uppercase text-holio-muted">
              Favorites
            </p>
            {favorites.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onMessage={() => handleMessage(contact)}
                onToggleFavorite={() => toggleFavorite(contact.id, !contact.isFavorite)}
                onBlock={() => blockUser(contact.contactUserId)}
                onRemove={() => removeContact(contact.id)}
              />
            ))}
          </div>
        )}

        {regular.length > 0 && (
          <div className="px-3 pb-2">
            {favorites.length > 0 && (
              <p className="px-1 py-1.5 text-[11px] font-semibold uppercase text-holio-muted">
                All Contacts
              </p>
            )}
            {regular.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onMessage={() => handleMessage(contact)}
                onToggleFavorite={() => toggleFavorite(contact.id, !contact.isFavorite)}
                onBlock={() => blockUser(contact.contactUserId)}
                onRemove={() => removeContact(contact.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddContactModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

function ContactRow({
  contact,
  onMessage,
  onToggleFavorite,
  onBlock,
  onRemove,
}: {
  contact: Contact
  onMessage: () => void
  onToggleFavorite: () => void
  onBlock: () => void
  onRemove: () => void
}) {
  const [showActions, setShowActions] = useState(false)
  const user = contact.contactUser
  const displayName = contact.nickname || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={displayName}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender/30 text-sm font-semibold text-holio-text">
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-medium text-holio-text">{displayName}</span>
          {contact.isFavorite && <Star className="h-3 w-3 fill-holio-orange text-holio-orange" />}
        </div>
        {user.username && (
          <p className="truncate text-xs text-holio-muted">@{user.username}</p>
        )}
      </div>

      {showActions && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMessage}
            className="flex h-7 w-7 items-center justify-center rounded-full text-holio-muted hover:bg-holio-lavender/20 hover:text-holio-text"
            title="Send message"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggleFavorite}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full hover:bg-holio-lavender/20',
              contact.isFavorite ? 'text-holio-orange' : 'text-holio-muted hover:text-holio-text',
            )}
            title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('h-3.5 w-3.5', contact.isFavorite && 'fill-current')} />
          </button>
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-full text-holio-muted hover:bg-red-50 hover:text-red-500"
            title="Remove contact"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function AddContactModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const addContact = useContactsStore((s) => s.addContact)

  const handleAdd = async () => {
    if (!phone.trim()) return
    setAdding(true)
    setError('')
    try {
      await addContact(phone.trim())
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to add contact')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold text-holio-text">Add Contact</h3>
        <p className="mb-3 text-sm text-holio-muted">
          Enter the user ID of the person you want to add.
        </p>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="User ID"
          className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-holio-text outline-none focus:border-holio-orange"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-holio-muted hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={adding || !phone.trim()}
            className="rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white hover:bg-holio-orange/90 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
