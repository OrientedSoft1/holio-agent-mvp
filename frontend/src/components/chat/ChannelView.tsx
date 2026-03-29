import { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  MoreVertical,
  BellOff,
  Pin,
  Eye,
  MessageSquare,
  Paperclip,
  Mic,
  Send,
  ChevronDown,
  Smile,
  Bell,
  FileText,
  ExternalLink,
  Radio,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface FileAttachment {
  name: string
  size: string
  type: string
}

interface LinkPreview {
  url: string
  title: string
  description: string
  domain: string
}

interface ChannelPost {
  id: string
  content: string
  timestamp: string
  viewCount: number
  commentCount: number
  attachment?: FileAttachment
  linkPreview?: LinkPreview
}

interface ChannelViewProps {
  channelName: string
  channelAvatar?: string | null
  subscriberCount: number
  isAdmin?: boolean
  isMuted?: boolean
  pinnedMessage?: string
  onBack?: () => void
  onInfoClick?: () => void
}

const MOCK_POSTS: ChannelPost[] = [
  {
    id: '1',
    content:
      'We are excited to announce a new integration with our AI agent platform! Starting next week, all company channels will support automated summaries powered by Holio Agent bots.',
    timestamp: '2:34 PM',
    viewCount: 1127,
    commentCount: 24,
    attachment: {
      name: 'Holio_Agent_Integration_Guide.pdf',
      size: '2.4 MB',
      type: 'pdf',
    },
  },
  {
    id: '2',
    content:
      'Reminder: The Q1 company all-hands meeting is tomorrow at 10:00 AM. Please join via the Events channel. Agenda includes product roadmap updates and team highlights.',
    timestamp: '11:15 AM',
    viewCount: 843,
    commentCount: 12,
    linkPreview: {
      url: 'https://holio.app/events/all-hands-q1',
      title: 'Q1 All-Hands Meeting — Holio Events',
      description:
        'Join us for the quarterly all-hands meeting with product roadmap and team highlights.',
      domain: 'holio.app',
    },
  },
  {
    id: '3',
    content:
      'New office policy update — hybrid work schedule will now default to 3 days in-office starting April 1st. Reach out to your team lead if you have questions.',
    timestamp: '9:02 AM',
    viewCount: 2301,
    commentCount: 56,
  },
  {
    id: '4',
    content:
      'Welcome to all new hires this month! Check the #onboarding channel for resources and feel free to introduce yourselves here.',
    timestamp: 'Yesterday',
    viewCount: 614,
    commentCount: 8,
  },
]

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function ChannelView({
  channelName,
  channelAvatar,
  subscriberCount,
  isAdmin = true,
  isMuted = false,
  pinnedMessage = 'Welcome to the channel! Please read the rules before posting.',
  onBack,
  onInfoClick,
}: ChannelViewProps) {
  const [broadcastText, setBroadcastText] = useState('')
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
      {/* Header */}
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
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange/15 text-sm font-bold text-holio-orange">
              {initials}
            </div>
          )}

          <button onClick={onInfoClick} className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-holio-text">
                {channelName}
              </h3>
              {isMuted && <BellOff className="h-3.5 w-3.5 text-holio-muted" />}
            </div>
            <p className="text-xs text-holio-muted">
              {formatCount(subscriberCount)} Subscribers
            </p>
          </button>
        </div>

        <button
          onClick={onInfoClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Pinned message banner */}
      {pinnedMessage && (
        <button
          onClick={() => setPinnedExpanded((v) => !v)}
          className="flex items-start gap-2.5 border-b border-l-4 border-b-holio-orange/10 border-l-[#FF9220] bg-orange-50 px-4 py-2.5 text-left transition-colors hover:bg-orange-100/60"
        >
          <Pin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF9220]" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-[#FF9220]">
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

      {/* Posts feed */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {MOCK_POSTS.map((post) => (
          <div
            key={post.id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                {channelAvatar ? (
                  <img
                    src={channelAvatar}
                    alt={channelName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-holio-orange/15 text-[10px] font-bold text-holio-orange">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-bold text-[#FF9220]">
                  {channelName}
                </span>
              </div>

              {post.attachment && (
                <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF9220]/10">
                    <FileText className="h-5 w-5 text-[#FF9220]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-holio-text">
                      {post.attachment.name}
                    </p>
                    <p className="text-xs text-holio-muted">
                      {post.attachment.size}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm leading-relaxed text-holio-text">
                {post.content}
              </p>

              {post.linkPreview && (
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                  <div className="border-l-4 border-[#FF9220] bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-holio-text">
                      {post.linkPreview.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-holio-muted">
                      {post.linkPreview.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-[#FF9220]">
                      <ExternalLink className="h-3 w-3" />
                      {post.linkPreview.domain}
                    </div>
                  </div>
                </div>
              )}

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
                <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
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

      {/* Broadcast input bar (admin) */}
      {isAdmin && (
        <div className="border-t border-gray-100 bg-white">
          <div className="flex items-center gap-1 px-3 pt-2">
            <Radio className="h-3 w-3 text-[#FF9220]" />
            <span className="text-[11px] font-semibold tracking-wide text-[#FF9220] uppercase">
              Broadcast
            </span>
          </div>
          <div className="flex items-end gap-2 px-3 pb-2.5 pt-1.5">
            <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
              <Smile className="h-5 w-5" />
            </button>

            <div className="flex min-h-[40px] flex-1 items-center rounded-2xl bg-gray-100 px-4">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Broadcast a message..."
                className="w-full bg-transparent py-2.5 text-sm text-holio-text outline-none placeholder:text-holio-muted"
              />
            </div>

            <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
              <Bell className="h-5 w-5" />
            </button>

            <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
              <Paperclip className="h-5 w-5" />
            </button>

            {broadcastText.trim() ? (
              <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF9220] text-white transition-colors hover:bg-[#FF9220]/90">
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
