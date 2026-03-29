import { ChevronLeft, MoreVertical, Pin, Hash, Plus } from 'lucide-react'

interface Topic {
  id: string
  name: string
  emoji?: string
  lastMessage?: { senderName: string; content: string; createdAt: string }
  unreadCount: number
  isPinned?: boolean
  messageCount: number
}

interface TopicListPanelProps {
  groupName: string
  groupAvatar?: string | null
  memberCount: number
  topics: Topic[]
  onTopicSelect: (topicId: string) => void
  onBack?: () => void
  onNewTopic?: () => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function GroupInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-dark">
      {initials}
    </div>
  )
}

function TopicIcon({ emoji }: { emoji?: string }) {
  if (emoji) {
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender/30 text-lg">
        {emoji}
      </div>
    )
  }

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-sage/30">
      <Hash className="h-5 w-5 text-holio-dark/60" />
    </div>
  )
}

export default function TopicListPanel({
  groupName,
  groupAvatar,
  memberCount,
  topics,
  onTopicSelect,
  onBack,
  onNewTopic,
}: TopicListPanelProps) {
  const pinned = topics.filter((t) => t.isPinned)
  const unpinned = topics.filter((t) => !t.isPinned)
  const sorted = [...pinned, ...unpinned]

  return (
    <div className="flex h-full w-full flex-col bg-white sm:w-80 sm:flex-shrink-0 sm:border-r sm:border-gray-100">
      {/* Header */}
      <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[#fafafa] px-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="flex items-center gap-3">
            {groupAvatar ? (
              <img
                src={groupAvatar}
                alt={groupName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <GroupInitials name={groupName} />
            )}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-medium leading-tight text-holio-text">
                {groupName}
              </h3>
              <p className="text-sm text-holio-muted">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Topic list */}
      <div className="relative flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <Hash className="h-8 w-8 text-holio-lavender" />
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">No topics yet</p>
            <p className="mt-1 text-xs text-holio-muted">
              Create a topic to organize discussions
            </p>
          </div>
        ) : (
          sorted.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicSelect(topic.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <TopicIcon emoji={topic.emoji} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {topic.isPinned && (
                      <Pin className="h-3.5 w-3.5 flex-shrink-0 text-holio-muted" />
                    )}
                    <span className="truncate text-[15px] font-bold text-holio-text">
                      {topic.name}
                    </span>
                  </div>
                  {topic.lastMessage && (
                    <span className="flex-shrink-0 text-xs text-holio-muted">
                      {formatTime(topic.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  {topic.lastMessage ? (
                    <p className="truncate text-[13px] text-holio-muted">
                      <span className="font-medium text-holio-text/70">
                        {topic.lastMessage.senderName}:
                      </span>{' '}
                      {topic.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-[13px] text-holio-muted">No messages yet</p>
                  )}

                  {topic.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange px-1.5 text-[11px] font-semibold leading-none text-white">
                      {topic.unreadCount > 99 ? '99+' : topic.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}

        {/* FAB - New Topic */}
        {onNewTopic && (
          <button
            onClick={onNewTopic}
            className="absolute right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-holio-orange shadow-lg transition-transform hover:scale-105 active:scale-95"
            title="New Topic"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
