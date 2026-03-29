import { Phone, MoreVertical, ShieldCheck, Lock } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

interface SecretChatInvitationProps {
  chat: Chat
}

export default function SecretChatInvitation({
  chat,
}: SecretChatInvitationProps) {
  const inviterName = chat.name ?? 'Unknown'
  const inviterAvatar = chat.avatarUrl
  const inviterStatus = 'last seen recently'

  const initials = inviterName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <header className="flex h-[72px] flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-[#fafafa] px-4">
        <div className="relative">
          {inviterAvatar ? (
            <img
              src={inviterAvatar}
              alt={inviterName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-holio-sage text-sm font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-holio-sage">
            <Lock className="h-3 w-3 text-white" />
          </div>
        </div>

        <div className="ml-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-lg font-medium text-holio-text">{inviterName}</h3>
            <Lock className="h-4 w-4 flex-shrink-0 text-holio-sage" />
          </div>
          <p className="truncate text-sm text-holio-muted">{inviterStatus}</p>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
            <Phone className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-sage/20">
              <ShieldCheck className="h-8 w-8 text-holio-sage" />
            </div>
          </div>

          <p className="mb-4 text-center text-base font-medium text-holio-text">
            {inviterName} invited you to join a secret chat.
          </p>

          <p className="mb-2 text-sm font-bold text-holio-text">Secret chats:</p>
          <ul className="space-y-1.5 text-sm text-holio-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-holio-muted" />
              Use end-to-end encryption
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-holio-muted" />
              Leave no trace on our servers
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-holio-muted" />
              Have a self-destruct timer
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-holio-muted" />
              Do not allow forwarding
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        <button
          className="w-full rounded-xl bg-holio-orange py-3 text-base font-medium text-white transition-colors hover:bg-holio-orange/90 active:bg-holio-orange/80"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
