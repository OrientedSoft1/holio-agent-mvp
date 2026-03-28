import { Plus } from 'lucide-react'
import type { StoryGroup } from '../../types'

interface StoryCircleProps {
  group: StoryGroup
  isOwn?: boolean
  onClick: () => void
}

export default function StoryCircle({ group, isOwn, onClick }: StoryCircleProps) {
  const allViewed = group.stories.every((s) => s.viewed)
  const user = group.user

  return (
    <button
      onClick={onClick}
      className="flex flex-shrink-0 flex-col items-center gap-1"
    >
      <div className="relative">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full p-[2px] ${
            allViewed
              ? 'bg-gray-300'
              : 'bg-gradient-to-br from-holio-orange to-orange-500'
          }`}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName ?? ''}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-holio-muted">
                {(user.firstName ?? '?')[0]}
              </span>
            )}
          </div>
        </div>
        {isOwn && (
          <div className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-holio-orange">
            <Plus className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <span className="w-16 truncate text-center text-[11px] text-holio-muted">
        {isOwn ? 'My Story' : user.firstName ?? user.username}
      </span>
    </button>
  )
}
