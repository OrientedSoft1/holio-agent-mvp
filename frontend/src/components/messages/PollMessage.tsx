import { useState } from 'react'
import { Check, X, Lock } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface PollOption {
  id: string
  text: string
  votes: number
  voters?: string[]
}

export interface PollData {
  question: string
  options: PollOption[]
  totalVotes: number
  isAnonymous?: boolean
  isQuiz?: boolean
  correctOptionId?: string
  isClosed?: boolean
  myVote?: string
  creatorId?: string
}

interface PollMessageProps {
  poll: PollData
  isMine: boolean
  currentUserId?: string
  onVote: (optionId: string) => void
  onClose?: () => void
}

export default function PollMessage({ poll, isMine, currentUserId, onVote, onClose }: PollMessageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(poll.myVote ?? null)
  const hasVoted = selectedId !== null
  const isCreator = currentUserId === poll.creatorId

  const handleVote = (optionId: string) => {
    if (poll.isClosed || hasVoted) return
    setSelectedId(optionId)
    onVote(optionId)
  }

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const getBarColor = (option: PollOption) => {
    if (!hasVoted) return ''
    if (poll.isQuiz) {
      if (option.id === poll.correctOptionId) return 'bg-green-500'
      if (option.id === selectedId && option.id !== poll.correctOptionId) return 'bg-red-400'
      return 'bg-gray-200 dark:bg-gray-600'
    }
    if (option.id === selectedId) return 'bg-holio-orange'
    return 'bg-gray-200 dark:bg-gray-600'
  }

  return (
    <div className={cn(
      'w-72 rounded-2xl p-4',
      isMine ? 'bg-holio-orange text-white' : 'bg-white text-holio-text dark:bg-gray-800 dark:text-white',
    )}>
      <p className="mb-3 text-sm font-bold leading-snug">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = getPercentage(option.votes + (selectedId === option.id && !poll.myVote ? 1 : 0))
          const isSelected = option.id === selectedId

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || poll.isClosed}
              className={cn(
                'relative w-full overflow-hidden rounded-lg px-3 py-2 text-left text-sm transition-colors',
                !hasVoted && !poll.isClosed
                  ? isMine
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                  : 'cursor-default bg-transparent',
              )}
            >
              {hasVoted && (
                <div
                  className={cn('absolute inset-y-0 left-0 transition-all duration-500', getBarColor(option))}
                  style={{ width: `${pct}%`, opacity: 0.2 }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected && hasVoted && (
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  <span className={isSelected && hasVoted ? 'font-medium' : ''}>{option.text}</span>
                </div>
                {hasVoted && (
                  <span className="ml-2 flex-shrink-0 text-xs font-medium">
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs opacity-70">
          {poll.isAnonymous && (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Anonymous
            </span>
          )}
          <span>{poll.totalVotes + (selectedId && !poll.myVote ? 1 : 0)} votes</span>
        </div>
        {isCreator && !poll.isClosed && onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              isMine ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            )}
          >
            <X className="h-3 w-3" /> Close
          </button>
        )}
      </div>

      {poll.isClosed && (
        <p className="mt-2 text-center text-xs font-medium opacity-60">Poll closed</p>
      )}
    </div>
  )
}
