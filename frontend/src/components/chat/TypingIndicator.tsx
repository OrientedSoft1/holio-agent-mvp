import { useChatStore } from '../../stores/chatStore'

interface TypingIndicatorProps {
  chatId: string
}

export default function TypingIndicator({ chatId }: TypingIndicatorProps) {
  const typingUsers = useChatStore((s) => s.typingUsers[chatId])
  const count = typingUsers?.length ?? 0

  if (count === 0) return null

  const label =
    count === 1
      ? 'Someone is typing'
      : `${count} people are typing`

  return (
    <div className="flex items-center gap-2 px-6 py-1.5">
      <div className="flex items-center gap-0.5">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-holio-orange [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-holio-orange [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-holio-orange [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-holio-muted">{label}</span>
    </div>
  )
}
