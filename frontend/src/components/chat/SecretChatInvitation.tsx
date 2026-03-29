import {
  ChevronLeft,
  Phone,
  MoreVertical,
  Lock,
  Server,
  Timer,
  Forward,
} from 'lucide-react'

interface SecretChatInvitationProps {
  userName: string
  userAvatar?: string | null
  onAccept: () => void
  onBack: () => void
}

const features = [
  { icon: Lock, text: 'Use end-to-end encryption' },
  { icon: Server, text: 'Leave no trace on our servers' },
  { icon: Timer, text: 'Have a self-destruct timer' },
  { icon: Forward, text: 'Do not allow forwarding' },
] as const

export default function SecretChatInvitation({
  userName,
  userAvatar,
  onAccept,
  onBack,
}: SecretChatInvitationProps) {
  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full flex-col bg-[#FCFCF8]">
      <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C6D5BA] text-sm font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#C6D5BA]">
            <Lock className="h-2.5 w-2.5 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-[#1A1A1A]">
            {userName}
          </h3>
          <p className="truncate text-xs text-[#8E8E93]">last seen recently</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]"
            aria-label="Call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="flex flex-1 flex-col items-center justify-center px-6"
        style={{
          backgroundImage:
            'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C6D5BA]/20">
              <Lock className="h-7 w-7 text-[#C6D5BA]" />
            </div>
          </div>

          <p className="mb-5 text-center text-[15px] font-bold text-[#1A1A1A]">
            {userName} invited you to join a secret chat.
          </p>

          <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
            Secret chats:
          </p>

          <ul className="space-y-2.5">
            {features.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-sm text-[#8E8E93]"
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-[#C6D5BA]" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-6 pt-3">
        <button
          onClick={onAccept}
          className="w-full rounded-xl bg-[#FF9220] py-3 text-base font-semibold text-white transition-colors hover:bg-[#FF9220]/90 active:bg-[#FF9220]/80"
        >
          Accept
        </button>
      </div>
    </div>
  )
}