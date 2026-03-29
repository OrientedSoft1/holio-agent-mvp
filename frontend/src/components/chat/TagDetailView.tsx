import { useState, useEffect, useCallback } from 'react'
import { X, Image, FileText, Mic, Link, MessageSquare } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTagStore } from '../../stores/tagStore'
import type { Message } from '../../types'

type TabKey = 'all' | 'media' | 'files' | 'voice' | 'links'

const TABS: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
  { key: 'all', label: 'All Messages', icon: MessageSquare },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'files', label: 'Files', icon: FileText },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'links', label: 'Links', icon: Link },
]

interface TagDetailViewProps {
  tag: { id: string; emoji: string; name: string }
  onClose: () => void
}

const TYPE_MAP: Record<TabKey, string[]> = {
  all: [],
  media: ['image'],
  files: ['file'],
  voice: ['voice'],
  links: ['text'],
}

function filterMessages(messages: Message[], tab: TabKey): Message[] {
  if (tab === 'all') return messages
  if (tab === 'links') {
    return messages.filter((m) => m.content && /https?:\/\//.test(m.content))
  }
  return messages.filter((m) => TYPE_MAP[tab].includes(m.type))
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function TagDetailView({ tag, onClose }: TagDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [visible, setVisible] = useState(false)
  const tagMessages = useTagStore((s) => s.tagMessages)
  const messagesLoading = useTagStore((s) => s.messagesLoading)
  const fetchTagMessages = useTagStore((s) => s.fetchTagMessages)

  useEffect(() => {
    fetchTagMessages(tag.id)
  }, [tag.id, fetchTagMessages])

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  const filtered = filterMessages(tagMessages, activeTab)

  const typeIcon = (msg: Message) => {
    switch (msg.type) {
      case 'image': return <Image className="h-4 w-4 text-holio-lavender" />
      case 'file': return <FileText className="h-4 w-4 text-holio-sage" />
      case 'voice': return <Mic className="h-4 w-4 text-holio-orange" />
      default:
        if (msg.content && /https?:\/\//.test(msg.content))
          return <Link className="h-4 w-4 text-blue-500" />
        return <MessageSquare className="h-4 w-4 text-holio-muted" />
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-holio-offwhite transition-transform duration-250 ease-out',
        visible ? 'translate-x-0' : 'translate-x-full',
      )}
      role="dialog"
      aria-label={`Tagged messages: ${tag.name}`}
    >
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{tag.emoji}</span>
          <h2 className="text-base font-semibold text-holio-text">
            {tag.name}
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 px-2 py-3 text-center text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'border-b-2 border-holio-orange text-holio-orange'
                : 'text-holio-muted hover:text-holio-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <span className="text-2xl">{tag.emoji}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">
              No messages found
            </p>
            <p className="mt-1 text-xs text-holio-muted">
              Messages tagged with {tag.emoji} {tag.name} will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl border border-gray-100 bg-white p-3.5 transition-colors hover:border-gray-200"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-holio-orange">
                    {msg.sender?.firstName ?? 'Unknown'}
                    {msg.sender?.lastName ? ` ${msg.sender.lastName}` : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {typeIcon(msg)}
                    <span className="text-[11px] text-holio-muted">
                      {formatTimeAgo(msg.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-holio-text">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
