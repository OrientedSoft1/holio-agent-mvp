import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldOff } from 'lucide-react'
import { useContactsStore } from '../stores/contactsStore'

export default function BlockedContactsPage() {
  const navigate = useNavigate()
  const { blocked, fetchBlocked, unblockUser } = useContactsStore()

  useEffect(() => {
    fetchBlocked()
  }, [fetchBlocked])

  const handleUnblock = async (userId: string) => {
    await unblockUser(userId)
    fetchBlocked()
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/contacts')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Blocked Contacts</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 rounded-2xl bg-holio-lavender/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-holio-muted" />
            <p className="text-sm text-holio-muted">
              Blocked users cannot send you messages, see your last seen, or call you.
            </p>
          </div>
        </div>

        {blocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 pt-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/10">
              <ShieldOff className="h-8 w-8 text-holio-muted" />
            </div>
            <p className="text-base font-semibold text-holio-text">No blocked contacts</p>
            <p className="mt-1 text-sm text-holio-muted">Users you block will appear here</p>
          </div>
        ) : (
          <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-gray-900">
            {blocked.map((contact, i) => {
              const user = contact.contactUser
              const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
              const initials = (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')

              return (
                <div key={contact.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={fullName}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender">
                        <span className="text-sm font-semibold text-holio-text">{initials}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-holio-text">{fullName}</p>
                      {user.username && (
                        <p className="text-xs text-holio-muted">@{user.username}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnblock(contact.contactUserId)}
                      className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
