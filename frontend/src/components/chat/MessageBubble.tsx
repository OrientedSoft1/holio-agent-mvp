import { Check, CheckCheck } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface MessageData {
  id: string
  content: string
  timestamp: string
  isMine: boolean
  senderName?: string
  isRead: boolean
  isGroup: boolean
}

interface MessageBubbleProps {
  message: MessageData
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex',
        message.isMine ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[70%] px-3.5 py-2',
          message.isMine
            ? 'rounded-2xl rounded-br-sm bg-holio-orange text-white'
            : 'rounded-2xl rounded-bl-sm bg-white text-holio-text',
        )}
      >
        {!message.isMine && message.isGroup && message.senderName && (
          <p className="mb-0.5 text-xs font-medium text-holio-orange">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1',
            message.isMine ? 'text-white/70' : 'text-holio-muted',
          )}
        >
          <span className="text-[11px]">{message.timestamp}</span>
          {message.isMine &&
            (message.isRead ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      </div>
    </div>
  )
}
