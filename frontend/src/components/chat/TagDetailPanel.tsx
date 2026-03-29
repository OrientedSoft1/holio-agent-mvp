import { useState, useEffect } from 'react'
import { X, Hash, MessageSquare, Image, File, Mic, Link } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTagStore } from '../../stores/tagStore'
import type { TaggedMessage } from '../../types'

type DetailTab = 'all' | 'media' | 'files' | 'voice' | 'links'

const TABS: { id: DetailTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'all', label: 'All Messages', icon: MessageSquare },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'files', label: 'Files', icon: File },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'links', label: 'Links', icon: Link },
]

interface TagDetailPanelProps {
  onClose: () => void
}

function TaggedMessageItem({ item }: { item: TaggedMessage }) {
  const formattedDate = new Date(item.taggedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = new Date(item.message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-holio-lavender/30 text-xs font-semibold text-holio-text">
        {item.message.sender?.firstName?.[0] ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-holio-text dark:text-white">
            {item.message.sender?.firstName ?? 'User'}
          </span>
          <span className="text-[10px] text-holio-muted">{formattedDate} {formattedTime}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-holio-muted">
          {item.message.content || `[${item.message.type}]`}
        </p>
      </div>
    </div>
  )
}

export default function TagDetailPanel({ onClose }: TagDetailPanelProps) {
  const activeTagId = useTagStore((s) => s.activeTagId)
  const tags = useTagStore((s) => s.tags)
  const taggedMessages = useTagStore((s) => s.taggedMessages)
  const fetchTaggedMessages = useTagStore((s) => s.fetchTaggedMessages)
  const loading = useTagStore((s) => s.loading)
  const [activeTab, setActiveTab] = useState<DetailTab>('all')

  const tag = tags.find((t) => t.id === activeTagId)

  useEffect(() => {
    if (activeTagId) fetchTaggedMessages(activeTagId)
  }, [activeTagId, fetchTaggedMessages])

  if (!tag) return null

  const allItems = taggedMessages[tag.id] ?? []
  const filteredItems = allItems.filter((item) => {
    switch (activeTab) {
      case 'media': return item.message.type === 'image' || item.message.type === 'gif' || item.message.type === 'videoNote'
      case 'files': return item.message.type === 'file'
      case 'voice': return item.message.type === 'voice'
      case 'links': return item.message.type === 'text' && item.message.metadata?.linkPreview
      default: return true
    }
  })

  const tagBg = tag.color === 'lavender' ? 'bg-holio-lavender/20' : 'bg-holio-sage/20'

  return (
    <div className="flex h-screen flex-shrink-0 flex-col border-l border-gray-100 bg-white dark:border-[#1E3035] dark:bg-[#152022]" style={{ width: '100%' }}>
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 dark:border-[#1E3035]">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-holio-orange" />
          <h3 className="text-sm font-semibold text-holio-text dark:text-white">Tag Detail</h3>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={cn('mx-4 mt-4 flex items-center gap-3 rounded-xl px-4 py-3', tagBg)}>
        <span className="text-2xl">{tag.emoji}</span>
        <div>
          <h4 className="text-base font-semibold text-holio-text dark:text-white">{tag.name}</h4>
          <p className="text-xs text-holio-muted">{allItems.length} tagged message{allItems.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mx-4 mt-4 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-holio-orange text-white'
                : 'bg-gray-100 text-holio-muted hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <MessageSquare className="h-5 w-5 text-holio-muted" />
            </div>
            <p className="mt-3 text-xs text-holio-muted">
              No {activeTab === 'all' ? '' : activeTab} messages tagged yet
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredItems.map((item) => (
              <TaggedMessageItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
