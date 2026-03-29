import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { Search, MessageSquarePlus, Plus } from 'lucide-react'
import ChatItem from './ChatItem'
import FolderTabs from './FolderTabs'
import StoryViewer from '../stories/StoryViewer'
import { useChatStore } from '../../stores/chatStore'
import { useCompanyStore } from '../../stores/companyStore'
import { useFolderStore } from '../../stores/folderStore'
import { useStoryStore } from '../../stores/storyStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'
import type { NavItem } from '../../stores/uiStore'

type FilterTab = 'all' | 'groups' | 'channels' | 'bots' | 'design'

const FILTER_TABS: { key: FilterTab; label: string; chatType?: Chat['type'] }[] = [
  { key: 'all', label: 'All' },
  { key: 'groups', label: 'Groups', chatType: 'group' },
  { key: 'channels', label: 'Channels', chatType: 'channel' },
  { key: 'bots', label: 'Bots', chatType: 'bot' },
  { key: 'design', label: 'Design' },
]

function ChatSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="h-[54px] w-[54px] flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-10 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-3.5 w-40 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

interface ChatListPanelProps {
  selectedChatId: string | null
  onSelectChat: (chat: Chat) => void
  sidebarFilter?: NavItem
}

const SIDEBAR_TITLES: Record<NavItem, string> = {
  all: 'Chats',
  personal: 'Personal',
  company: 'Company',
  channels: 'Channels',
  bots: 'Bots',
  favorites: 'Favorites',
  contacts: 'Contacts',
  stories: 'Stories',
}

function StoryRingAvatar({
  avatarUrl,
  fallback,
  hasUnseen,
  isOwn,
}: {
  avatarUrl: string | null
  fallback: string
  hasUnseen: boolean
  isOwn?: boolean
}) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full p-[2.5px]',
          hasUnseen
            ? 'bg-gradient-to-br from-holio-orange via-orange-400 to-yellow-400'
            : 'bg-gray-300',
        )}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fallback} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-holio-muted">
              {fallback[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
      </div>
      {isOwn && (
        <div className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-holio-offwhite bg-holio-orange">
          <Plus className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  )
}

export default function ChatListPanel({
  selectedChatId,
  onSelectChat,
  sidebarFilter = 'all',
}: ChatListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [scrolled, setScrolled] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const chats = useChatStore((s) => s.chats)
  const loading = useChatStore((s) => s.loading)
  const fetchChats = useChatStore((s) => s.fetchChats)
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const filterChats = useFolderStore((s) => s.filterChats)
  const storyGroups = useStoryStore((s) => s.storyGroups)
  const fetchStories = useStoryStore((s) => s.fetchStories)
  const openViewer = useStoryStore((s) => s.openViewer)
  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => { fetchChats(activeCompany?.id) }, [fetchChats, activeCompany?.id])
  useEffect(() => { fetchStories() }, [fetchStories])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (el) setScrolled(el.scrollTop > 60)
  }, [])

  const tabCounts = useMemo(() => {
    const f = filterChats(chats)
    return {
      all: f.length,
      groups: f.filter((c) => c.type === 'group').length,
      channels: f.filter((c) => c.type === 'channel').length,
      bots: f.filter((c) => c.type === 'bot').length,
      design: f.filter((c) => c.name?.toLowerCase().includes('design')).length,
    }
  }, [chats, filterChats])

  const displayedChats = useMemo(() => {
    let result = filterChats(chats)

    if (sidebarFilter === 'personal') result = result.filter((c) => c.type === 'private')
    else if (sidebarFilter === 'company') result = result.filter((c) => c.companyId === activeCompany?.id && c.companyId != null)
    else if (sidebarFilter === 'channels') result = result.filter((c) => c.type === 'channel')
    else if (sidebarFilter === 'bots') result = result.filter((c) => c.type === 'bot')
    else if (sidebarFilter === 'favorites') result = result.filter((c) => c.isPinned)

    if (activeTab !== 'all') {
      const tab = FILTER_TABS.find((t) => t.key === activeTab)
      if (tab?.chatType) result = result.filter((c) => c.type === tab.chatType)
      else if (activeTab === 'design') result = result.filter((c) => c.name?.toLowerCase().includes('design'))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => c.name?.toLowerCase().includes(q) || c.lastMessage?.content.toLowerCase().includes(q))
    }

    return result
  }, [chats, filterChats, searchQuery, activeTab, sidebarFilter, activeCompany?.id])

  return (
    <div className="flex h-full w-full flex-col bg-holio-offwhite">
      <div className={cn('flex flex-shrink-0 items-center justify-between px-4 transition-all duration-200', scrolled ? 'h-12' : 'h-14')}>
        <h1 className={cn('font-bold leading-tight text-holio-text transition-all duration-200', scrolled ? 'text-lg' : 'text-2xl')}>
          {SIDEBAR_TITLES[sidebarFilter]}
        </h1>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
          title="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {showSearch && (
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-holio-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl bg-white py-2 pr-4 pl-9 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50"
              autoFocus
            />
          </div>
        </div>
      )}

      <div className={cn('overflow-hidden transition-all duration-300', scrolled ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100')}>
        <div className="flex gap-3 overflow-x-auto px-4 py-2 scrollbar-none">
          {currentUser && (
            <button onClick={() => openViewer(0)} className="flex flex-shrink-0 flex-col items-center gap-1">
              <StoryRingAvatar avatarUrl={currentUser.avatarUrl} fallback={currentUser.firstName ?? 'Me'} hasUnseen={false} isOwn />
              <span className="w-16 truncate text-center text-[11px] text-holio-muted">My Stories</span>
            </button>
          )}
          {storyGroups.filter((g) => g.user.id !== currentUser?.id).map((group, index) => {
            const hasUnseen = group.stories.some((s) => !s.viewed)
            return (
              <button key={group.user.id} onClick={() => openViewer(currentUser ? index + 1 : index)} className="flex flex-shrink-0 flex-col items-center gap-1">
                <StoryRingAvatar avatarUrl={group.user.avatarUrl} fallback={group.user.firstName ?? group.user.username ?? '?'} hasUnseen={hasUnseen} />
                <span className="w-16 truncate text-center text-[11px] text-holio-muted">{group.user.firstName ?? group.user.username}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={cn('z-10 bg-holio-offwhite transition-all duration-200', scrolled ? 'sticky top-0 shadow-sm' : '')}>
        <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const count = tabCounts[tab.key as keyof typeof tabCounts]
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2 pt-1.5 text-[14px] font-medium transition-colors',
                  isActive ? 'border-holio-orange text-holio-orange' : 'border-transparent text-holio-muted hover:text-holio-text',
                )}
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none', isActive ? 'bg-holio-orange/15 text-holio-orange' : 'bg-gray-200/60 text-holio-muted')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="h-px bg-gray-100" />
      </div>

      <FolderTabs />

      <div ref={scrollContainerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto scrollbar-none">
        {loading ? (
          <>{Array.from({ length: 5 }, (_, i) => <ChatSkeleton key={i} />)}</>
        ) : displayedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/15">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-holio-lavender/25">
                <MessageSquarePlus className="h-7 w-7 text-holio-lavender" />
              </div>
            </div>
            <p className="mt-5 text-sm font-semibold text-holio-text">No conversations yet</p>
            <p className="mt-1.5 text-xs leading-relaxed text-holio-muted">Start a new chat to begin messaging</p>
          </div>
        ) : (
          displayedChats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} isSelected={selectedChatId === chat.id} onClick={() => onSelectChat(chat)} />
          ))
        )}
      </div>

      <StoryViewer />
    </div>
  )
}
