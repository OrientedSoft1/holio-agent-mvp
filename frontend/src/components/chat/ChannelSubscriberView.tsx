import { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  MoreVertical,
  BellOff,
  Pin,
  Eye,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface ChannelPost {
  id: string
  content: string
  timestamp: string
  viewCount: number
  commentCount: number
}

interface ChannelSubscriberViewProps {
  channelName: string
  channelAvatar?: string | null
  subscriberCount: number
  isMuted?: boolean
  pinnedMessage?: string
  posts?: ChannelPost[]
  onBack?: () => void
  onInfoClick?: () => void
  onToggleMute?: () => void
  onLeaveComment?: (postId: string) => void
}

const MOCK_POSTS: ChannelPost[] = [
  {
    id: '1',
    content:
      'We are excited to announce our Q2 product roadmap! Key highlights include a revamped dashboard, improved analytics, and new integrations with third-party tools. Stay tuned for weekly updates.',
    timestamp: '10:32 AM',
    viewCount: 1248,
    commentCount: 34,
  },
  {
    id: '2',
    content:
      'Reminder: All-hands meeting tomorrow at 3 PM CET. We will cover the latest company metrics, upcoming hiring plans, and a live demo of the new AI agent features.',
    timestamp: '9:15 AM',
    viewCount: 843,
    commentCount: 12,
  },
  {
    id: '3',
    content:
      'Our design system v2.0 is now live! Check out the updated component library and brand guidelines in the shared drive. Feedback is welcome in #design-feedback.',
    timestamp: 'Yesterday',
    viewCount: 2061,
    commentCount: 57,
  },
]

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function ChannelSubscriberView({
  channelName,
  channelAvatar,
  subscriberCount,
  isMuted = false,
  pinnedMessage = 'Welcome to the channel! Please read the rules before posting.',
  posts = MOCK_POSTS,
  onBack,
  onInfoClick,
  onToggleMute,
  onLeaveComment,
}: ChannelSubscriberViewProps) {
  const [pinnedExpanded, setPinnedExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  const initials = channelName
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
            <ChevronLeft className="h-5 w-5" />
          </button>
          {channelAvatar ? (
            <img
              src={channelAvatar}
              alt={channelName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-holio-orange/15 text-sm font-bold text-holio-orange">
              {initials}
            </div>
          )}
          <button onClick={onInfoClick} className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-holio-text">
                {channelName}
              </h3>
              {isMuted && (
                <BellOff className="h-3.5 w-3.5 text-holio-muted" />
              )}
            </div>
            <p className="text-xs text-holio-muted">
              {formatCount(subscriberCount)} Subscribers
            </p>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            aria-label={isMuted ? 'Unmute channel' : 'Mute channel'}
          >
            <BellOff className="h-5 w-5" />
          </button>
          <button
            onClick={onInfoClick}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {pinnedMessage && (
        <button
          onClick={() => setPinnedExpanded((v) => !v)}
          className="flex items-start gap-2.5 border-b border-holio-orange/10 bg-holio-orange/10 px-4 py-2.5 text-left transition-colors hover:bg-holio-orange/15"
        >
          <Pin className="mt-0.5 h-4 w-4 flex-shrink-0 text-holio-orange" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-holio-orange">
              Pinned Message
            </span>
            <p
              className={cn(
                'mt-0.5 text-xs leading-relaxed text-holio-text',
                !pinnedExpanded && 'line-clamp-1',
              )}
            >
              {pinnedMessage}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'mt-0.5 h-4 w-4 flex-shrink-0 text-holio-muted transition-transform',
              pinnedExpanded && 'rotate-180',
            )}
          />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="p-4">
              <span className="text-sm font-bold text-holio-orange">
                {channelName}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-holio-text">
                {post.content}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-holio-muted">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {formatCount(post.viewCount)}
                    </span>
                  </div>
                  <span className="text-[11px] text-holio-muted">
                    {post.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => onLeaveComment?.(post.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    {post.commentCount > 0
                      ? `${post.commentCount} comments`
                      : 'Leave a comment'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
        <button
          onClick={onToggleMute}
          className="w-full bg-[#FF9220] py-3 font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#FF9220]/90"
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
      </div>
    </div>
  )
}
