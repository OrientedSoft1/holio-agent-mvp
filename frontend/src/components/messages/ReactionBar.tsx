import { cn } from '../../lib/utils'

export interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

interface ReactionBarProps {
  reactions: Reaction[]
  onToggle: (emoji: string) => void
  onAdd: () => void
}

export default function ReactionBar({ reactions, onToggle, onAdd }: ReactionBarProps) {
  if (reactions.length === 0) return null

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
            r.reacted
              ? 'border border-holio-lavender bg-holio-lavender/20 text-holio-text dark:text-white'
              : 'bg-gray-100 text-holio-text hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          )}
        >
          <span className="text-sm">{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-holio-muted transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        title="Add reaction"
      >
        +
      </button>
    </div>
  )
}
