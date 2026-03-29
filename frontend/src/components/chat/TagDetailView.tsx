import { useState, useEffect, useCallback } from 'react'
import { X, Image, FileText, Mic, Link, MessageSquare } from 'lucide-react'
import { cn } from '../../lib/utils'

type TabKey = 'all' | 'media' | 'files' | 'voice' | 'links'

const TABS: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
  { key: 'all', label: 'All Messages', icon: MessageSquare },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'files', label: 'Files', icon: FileText },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'links', label: 'Links', icon: Link },
]

interface TaggedMessage {
  id: string
  content: string
  senderName: string
  chatName: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'voice' | 'link'
}

interface TagDetailViewProps {
  tag: { id: string; emoji: string; name: string }
  onClose: () => void
}

const MOCK_MESSAGES: TaggedMessage[] = [
  { id: 'm1', content: 'Check out the updated wireframes for the dashboard', senderName: 'Alice Chen', chatName: 'Product Team', timestamp: '2 hours ago', type: 'text' },
  { id: 'm2', content: 'dashboard-v3-final.png', senderName: 'Bob Kim', chatName: 'Design Reviews', timestamp: '5 hours ago', type: 'image' },
  { id: 'm3', content: 'Q4 requirements document', senderName: 'Carol Reyes', chatName: 'Engineering', timestamp: 'Yesterday', type: 'file' },
  { id: 'm4', content: 'Voice note: Sprint retrospective summary', senderName: 'Dave Park', chatName: 'Standup', timestamp: '2 days ago', type: 'voice' },
  { id: 'm5', content: 'https://figma.com/file/abc123 — latest prototype', senderName: 'Eve Liu', chatName: 'Product Team', timestamp: '3 days ago', type: 'link' },
]

function filterMessages(messages: TaggedMessage[], tab: TabKey): TaggedMessage[] {
  if (tab === 'all') return messages
  const typeMap: Record<TabKey, TaggedMessage['type'][]> = {
    all: [],
    media: ['image'],
    files: ['file'],
    voice: ['voice'],
    links: ['link'],
  }
  return messages.filter((m) => typeMap[tab].includes(m.type))
}

export default function TagDetailView({ tag, onClose }: TagDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [visible, setVisible] = useState(false)

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

  const filtered = filterMessages(MOCK_MESSAGES, activeTab)

  const typeIcon = (type: TaggedMessage['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4 text-holio-lavender" />
      case 'file': return <FileText className="h-4 w-4 text-holio-sage" />
      case 'voice': return <Mic className="h-4 w-4 text-holio-orange" />
      case 'link': return <Link className="h-4 w-4 text-blue-500" />
      default: return <MessageSquare className="h-4 w-4 text-holio-muted" />
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
        {filtered.length === 0 ? (
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
                    {msg.senderName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {typeIcon(msg.type)}
                    <span className="text-[11px] text-holio-muted">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-holio-text">
                  {msg.content}
                </p>
                <p className="mt-2 text-[11px] text-holio-muted">
                  from <span className="font-medium">{msg.chatName}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
