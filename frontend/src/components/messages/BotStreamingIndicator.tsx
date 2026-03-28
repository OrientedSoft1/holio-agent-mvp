import { Bot } from 'lucide-react'

interface BotStreamingIndicatorProps {
  botName: string
  botType?: string
}

const TYPE_COLORS: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  custom: 'bg-holio-dark',
}

export default function BotStreamingIndicator({
  botName,
  botType = 'custom',
}: BotStreamingIndicatorProps) {
  const color = TYPE_COLORS[botType] ?? TYPE_COLORS.custom

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2.5 max-w-[70%]">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${color}`}
        >
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-holio-orange">
            {botName}
          </p>
          <div className="flex items-center gap-2 rounded-xl rounded-bl-sm border-l-4 border-holio-lavender bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1">
              <span className="bot-dot-1 h-2 w-2 rounded-full bg-holio-lavender" />
              <span className="bot-dot-2 h-2 w-2 rounded-full bg-holio-lavender" />
              <span className="bot-dot-3 h-2 w-2 rounded-full bg-holio-lavender" />
            </div>
            <span className="text-xs text-holio-muted">Bot is thinking…</span>
          </div>
        </div>
      </div>
    </div>
  )
}
