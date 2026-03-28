import { ArrowLeft, Lock, Phone, MoreVertical, Shield } from 'lucide-react'

interface SecretChatInviteProps {
  userName: string
  userAvatar?: string
  onAccept: () => void
  onBack: () => void
}

const FEATURES = [
  'Use end-to-end encryption',
  'Leave no trace on servers',
  'Have a self-destruct timer',
  'Do not allow forwarding',
]

export default function SecretChatInvite({
  userName,
  userAvatar,
  onAccept,
  onBack,
}: SecretChatInviteProps) {
  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-sage text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            <div className="absolute right-0 bottom-0 rounded-full bg-holio-sage p-0.5">
              <Lock className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-holio-text">{userName}</h3>
            <p className="text-xs text-holio-muted">last seen recently</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[Phone, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-holio-text">
            <span className="font-semibold">{userName}</span> invited you to join
            a secret chat.
          </p>
          <p className="mt-4 text-sm font-bold text-holio-text">Secret chats:</p>
          <ul className="mt-2 space-y-2.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-holio-sage" />
                <span className="text-sm text-holio-text">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onAccept}
          className="h-12 w-full rounded-xl bg-holio-orange font-semibold text-white transition-colors hover:bg-holio-orange/90"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
