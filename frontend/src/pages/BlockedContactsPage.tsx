import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldOff, User } from 'lucide-react'
import { useContactsStore } from '../stores/contactsStore'
import { cn } from '../lib/utils'

export default function BlockedContactsPage() {
  const navigate = useNavigate()
  const { blocked, fetchBlocked, unblockUser } = useContactsStore()
  const [unblocking, setUnblocking] = useState<Set<string>>(new Set())

  useEffect(() => { fetchBlocked() }, [fetchBlocked])

  const handleUnblock = async (userId: string) => {
    setUnblocking((s) => new Set(s).add(userId))
    try {
      await unblockUser(userId)
    } catch { /* silent */ }
    setUnblocking((s) => { const n = new Set(s); n.delete(userId); return n })
  }

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Blocked Contacts</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mb-4 rounded-xl bg-[#D1CBFB]/10 p-4">
          <p className="text-xs text-[#1A1A1A]">
            Blocked users can't send you messages, add you to groups, or see your last seen and profile photo.
          </p>
        </div>

        {blocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <ShieldOff className="mb-3 h-14 w-14 text-[#8E8E93]/25" />
            <p className="text-base font-medium text-[#1A1A1A]">No blocked contacts</p>
            <p className="mt-1 text-sm text-[#8E8E93]">Users you block will appear here</p>
          </div>
        ) : (
          <div className="mx-4 rounded-2xl bg-white">
            {blocked.map((contact, i) => {
              const user = contact.contactUser
              const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unknown'
              return (
                <div key={contact.id}>
                  {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D1CBFB]/20">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-[#D1CBFB]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1A1A1A]">{name}</p>
                      {user?.phone && <p className="text-xs text-[#8E8E93]">{user.phone}</p>}
                    </div>
                    <button
                      onClick={() => handleUnblock(contact.contactUserId)}
                      disabled={unblocking.has(contact.contactUserId)}
                      className={cn('rounded-lg px-3 py-1.5 text-xs font-medium text-[#FF9220] hover:bg-[#FF9220]/10 disabled:opacity-50')}
                    >
                      {unblocking.has(contact.contactUserId) ? 'Unblocking...' : 'Unblock'}
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
