import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, MoreVertical, Hash, MessageSquare, Headphones, Send, Paperclip, Smile, Mic } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TopicMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  type: 'text' | 'image'
}

interface TopicChatViewProps {
  topicId: string
  topicName: string
  topicEmoji?: string
  messageCount: number
  groupName: string
  groupAvatar?: string | null
  onBack: () => void
}

const SENDER_COLORS = [
  'text-violet-600',
  'text-rose-600',
  'text-emerald-600',
  'text-sky-600',
  'text-amber-600',
  'text-fuchsia-600',
  'text-teal-600',
  'text-red-500',
]

function getSenderColor(senderId: string): string {
  let hash = 0
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length]
}

const MOCK_MESSAGES: TopicMessage[] = [
  { id: '1', senderId: 'u1', senderName: 'Alice Chen', content: 'Has everyone reviewed the latest mockups?', createdAt: '2026-03-29T09:15:00Z', type: 'text' },
  { id: '2', senderId: 'u2', senderName: 'Marcus Wei', content: 'Yes! The new navigation flow looks great. I left some comments on the spacing.', createdAt: '2026-03-29T09:17:00Z', type: 'text' },
  { id: '3', senderId: 'u3', senderName: 'Priya Sharma', content: 'I think we should discuss the color palette in the voice chat. The contrast ratios might need adjusting.', createdAt: '2026-03-29T09:20:00Z', type: 'text' },
  { id: '4', senderId: 'u1', senderName: 'Alice Chen', content: 'Good call — let me set up a quick voice session.', createdAt: '2026-03-29T09:22:00Z', type: 'text' },
  { id: '5', senderId: 'u4', senderName: 'James Park', content: 'Can we also go over the mobile breakpoints? Some elements overflow on smaller screens.', createdAt: '2026-03-29T09:25:00Z', type: 'text' },
  { id: '6', senderId: 'u2', senderName: 'Marcus Wei', content: 'Absolutely, I captured screenshots of the issues on iPhone SE and Pixel 7.', createdAt: '2026-03-29T09:28:00Z', type: 'text' },
  { id: '7', senderId: 'u5', senderName: 'Lena Olsen', content: 'Joining the voice chat now — I have feedback on the icon set too.', createdAt: '2026-03-29T09:30:00Z', type: 'text' },
  { id: '8', senderId: 'u3', senderName: 'Priya Sharma', content: 'Perfect, see you all in the call!', createdAt: '2026-03-29T09:31:00Z', type: 'text' },
]

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function GroupInitials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className={cn('flex items-center justify-center rounded-full bg-holio-lavender text-xs font-semibold text-holio-dark', className)}>
      {initials}
    </div>
  )
}

export default function TopicChatView({
  topicName,
  topicEmoji,
  messageCount,
  groupName,
  groupAvatar,
  onBack,
}: TopicChatViewProps) {
  const [inputText, setInputText] = useState('')
  const [voiceBannerVisible, setVoiceBannerVisible] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = MOCK_MESSAGES

  const senderColorMap = useMemo(() => {
    const map = new Map<string, string>()
    messages.forEach((msg) => {
      if (!map.has(msg.senderId)) {
        map.set(msg.senderId, getSenderColor(msg.senderId))
      }
    })
    return map
  }, [messages])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const isSameSenderAsPrev = (idx: number) => {
    if (idx === 0) return false
    return messages[idx].senderId === messages[idx - 1].senderId
  }

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[#fafafa] px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            {topicEmoji ? (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender/30 text-lg">
                {topicEmoji}
              </div>
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-sage/30">
                <Hash className="h-5 w-5 text-holio-dark/60" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-medium leading-tight text-holio-text">
                {topicName}
              </h3>
              <div className="flex items-center gap-1 text-sm text-holio-muted">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{messageCount} messages</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {groupAvatar ? (
            <img
              src={groupAvatar}
              alt={groupName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <GroupInitials name={groupName} className="h-9 w-9" />
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Voice chat banner */}
      {voiceBannerVisible && (
        <div className="flex items-center justify-between border-b border-holio-lavender/30 bg-holio-lavender px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40">
              <Headphones className="h-4 w-4 text-holio-dark" />
            </div>
            <div>
              <p className="text-sm font-semibold text-holio-dark">Voice Chat</p>
              <p className="text-xs text-holio-dark/60">3 participants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-holio-orange px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
            >
              Join
            </button>
            <button
              onClick={() => setVoiceBannerVisible(false)}
              className="text-xs text-holio-dark/50 transition-colors hover:text-holio-dark"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto bg-gradient-to-b from-holio-lavender/15 to-holio-lavender/5 px-6 py-4"
      >
        {messages.map((msg, idx) => {
          const sameSender = isSameSenderAsPrev(idx)
          const senderColor = senderColorMap.get(msg.senderId) ?? 'text-violet-600'
          const senderInitial = msg.senderName[0].toUpperCase()

          return (
            <div key={msg.id} className={cn('flex gap-2', sameSender ? 'mt-0.5' : 'mt-3 first:mt-0')}>
              <div className="w-7 flex-shrink-0">
                {!sameSender && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-holio-lavender/30 text-[11px] font-semibold text-holio-text">
                    {senderInitial}
                  </div>
                )}
              </div>

              <div className="min-w-0 max-w-[75%]">
                {!sameSender && (
                  <p className={cn('mb-0.5 text-xs font-semibold', senderColor)}>
                    {msg.senderName}
                  </p>
                )}
                <div className="relative rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 shadow-sm">
                  <p className="text-sm leading-relaxed text-holio-text">{msg.content}</p>
                  <div className="mt-1 flex items-center justify-end">
                    <span className="text-[11px] text-holio-muted">{formatMessageTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 border-t border-gray-100 bg-white px-3 py-2.5">
        <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="flex min-h-[40px] flex-1 items-center rounded-2xl bg-gray-100 px-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message..."
            className="w-full bg-transparent py-2.5 text-sm text-holio-text placeholder:text-holio-muted outline-none"
          />
          <button className="ml-2 flex-shrink-0 text-holio-muted transition-colors hover:text-holio-text">
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {inputText.trim() ? (
          <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90">
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
