import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import EmojiPicker from '../chat/EmojiPicker'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

interface ReactionPickerProps {
  onReact: (emoji: string) => void
  isMine: boolean
}

export default function ReactionPicker({ onReact, isMine }: ReactionPickerProps) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div
      className={cn(
        'absolute -top-10 z-20 flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-1 py-0.5 shadow-lg dark:border-gray-600 dark:bg-gray-800',
        isMine ? 'right-0' : 'left-0',
      )}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-lg transition-transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowFull(!showFull)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        {showFull && (
          <EmojiPicker
            onSelect={(emoji) => {
              onReact(emoji)
              setShowFull(false)
            }}
            onClose={() => setShowFull(false)}
          />
        )}
      </div>
    </div>
  )
}
