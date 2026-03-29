import { useState, useEffect, useMemo } from 'react'
import { Search, X, ArrowLeft, Check } from 'lucide-react'
import { useContactsStore, type Contact } from '../../stores/contactsStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { useChatStore } from '../../stores/chatStore'

interface NewGroupModalProps {
  open: boolean
  onClose: () => void
  onChatCreated: (chatId: string) => void
}

function displayName(c: Contact): string {
  const u = c.contactUser
  return c.nickname || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.phone
}

type Step = 'members' | 'details'

export default function NewGroupModal({ open, onClose, onChatCreated }: NewGroupModalProps) {
  const [step, setStep] = useState<Step>('members')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const contacts = useContactsStore((s) => s.contacts)
  const loading = useContactsStore((s) => s.loading)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const createGroup = useChatStore((s) => s.createGroup)
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)

  useEffect(() => {
    if (open) {
      fetchContacts()
      setStep('members')
      setSearch('')
      setSelected(new Set())
      setName('')
      setDescription('')
      setError('')
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

  const toggleMember = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const selectedContacts = useMemo(() => {
    return contacts.filter((c) => selected.has(c.contactUserId))
  }, [contacts, selected])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Group name is required')
      return
    }
    if (selected.size === 0) {
      setError('Select at least one member')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const chat = await createGroup(name.trim(), Array.from(selected), description.trim() || undefined)
      onChatCreated(chat.id)
      onClose()
    } catch {
      setError('Failed to create group')
    } finally {
      setSubmitting(false)
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
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          {step === 'details' && (
            <button
              onClick={() => { setStep('members'); setError('') }}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-holio-muted" />
            </button>
          )}
          <h3 className="flex-1 text-lg font-semibold text-holio-text">
            {step === 'members' ? 'Add Members' : 'New Group'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-holio-muted" />
          </button>
        </div>

        {step === 'members' ? (
          <>
            {/* Selected chips */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5">
                {selectedContacts.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => toggleMember(ct.contactUserId)}
                    className="flex items-center gap-1 rounded-full bg-holio-lavender/20 px-2.5 py-1 text-xs font-medium text-holio-text transition-colors hover:bg-holio-lavender/40"
                  >
                    {displayName(ct)}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
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

            {/* Contact list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {loading && contacts.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
                </div>
              )}
              {sorted.map((ct) => {
                const u = ct.contactUser
                const nm = displayName(ct)
                const initials = nm.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                const isSelected = selected.has(ct.contactUserId)
                const isOnline = !!onlineUsers[ct.contactUserId]

                return (
                  <button
                    key={ct.id}
                    onClick={() => toggleMember(ct.contactUserId)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
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
                    </div>
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        isSelected
                          ? 'border-holio-orange bg-holio-orange'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Next button */}
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                onClick={() => { if (selected.size > 0) setStep('details') }}
                disabled={selected.size === 0}
                className="w-full rounded-xl bg-holio-orange py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-40"
              >
                Next ({selected.size} selected)
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Details form */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-holio-muted">
                  Group Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  placeholder="Enter group name..."
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-holio-muted">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group about?"
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-holio-muted">
                  {selected.size} member{selected.size !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContacts.map((ct) => (
                    <span
                      key={ct.id}
                      className="rounded-full bg-holio-lavender/20 px-2.5 py-1 text-xs font-medium text-holio-text"
                    >
                      {displayName(ct)}
                    </span>
                  ))}
                </div>
              </div>

              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </div>

            {/* Submit */}
            <div className="flex gap-2 border-t border-gray-100 px-5 py-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-holio-text transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-holio-orange py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
