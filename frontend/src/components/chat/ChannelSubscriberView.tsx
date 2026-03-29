import { useRef } from 'react'
import {
  MoreVertical,
  BellOff,
  Bell,
  Pin,
  Eye,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

interface ChannelSubscriberViewProps {
  chat: Chat
}

const MOCK_POSTS = [
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

export default function ChannelSubscriberView({ chat }: ChannelSubscriberViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const channelName = chat.name ?? 'Channel'
  const channelAvatar = chat.avatarUrl
  const subscriberCount = (chat as any).members?.length ?? 0
  const isMuted = chat.muted ?? false
  const pinnedMessage = (chat as any).pinnedMessage as string | undefined

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
            className="flex items-center gap-3 text-left"
          >
            {channelAvatar ? (
              <img
                src={channelAvatar}
                alt={channelName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-text">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-holio-text">
                {channelName}
              </h3>
              <p className="text-xs text-holio-muted">
                {subscriberCount.toLocaleString()} subscribers
              </p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            {isMuted ? (
              <BellOff className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pinned message */}
      {pinnedMessage && (
        <button className="flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-2 text-left transition-colors hover:bg-gray-50">
          <Pin className="h-4 w-4 flex-shrink-0 text-holio-orange" />
          <span className="truncate text-xs text-holio-text">
            {pinnedMessage}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 text-holio-muted" />
        </button>
      )}

      {/* Posts */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-holio-lavender text-[10px] font-semibold text-holio-text">
                    {initials}
                  </div>
                )}
                <span className="text-xs font-semibold text-holio-text">
                  {channelName}
                </span>
                <span className="text-[11px] text-holio-muted">
                  {post.timestamp}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-holio-text">
                {post.content}
              </p>
              <div className="mt-3 flex items-center gap-4 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1 text-holio-muted">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    {post.viewCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-holio-muted">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">{post.commentCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      {isMuted ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <button
            className="flex h-12 w-full items-center justify-center rounded-xl bg-holio-orange text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
          >
            UNMUTE
          </button>
        </div>
      ) : (
        <div className="flex h-12 items-center justify-center border-t border-gray-100 bg-white">
          <span className="text-xs text-holio-muted">Muted channel</span>
        </div>
      )}
    </div>
  )
}
