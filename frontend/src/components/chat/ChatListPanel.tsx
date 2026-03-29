import { useEffect, useState, useMemo, useRef } from 'react'
import { Search, MessageSquarePlus } from 'lucide-react'
import ChatItem from './ChatItem'
import FolderTabs from './FolderTabs'
import StoryCircle from '../stories/StoryCircle'
import StoryViewer from '../stories/StoryViewer'
import { useChatStore } from '../../stores/chatStore'
import { useCompanyStore } from '../../stores/companyStore'
import { useFolderStore } from '../../stores/folderStore'
import { useStoryStore } from '../../stores/storyStore'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pb-1 pt-3">
      <span className="text-[11px] font-semibold tracking-wider text-holio-muted uppercase">
        {children}
      </span>
    </div>
  )
}

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

function FavouriteCircle({
  chat,
  isSelected,
  onClick,
}: {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}) {
  const displayName = chat.name ?? 'Chat'
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = { private: '#6366f1', group: '#059669', channel: '#8b5cf6', bot: '#FF9220' }
  const color = colorMap[chat.type] ?? '#6366f1'

  return (
    <button
      onClick={onClick}
      className="flex flex-shrink-0 flex-col items-center gap-1"
    >
      <div className="relative">
        {chat.avatarUrl ? (
          <img
            src={chat.avatarUrl}
            alt={displayName}
            className={cn(
              'h-12 w-12 rounded-full object-cover ring-2',
              isSelected ? 'ring-holio-orange' : 'ring-transparent',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full text-xs font-semibold text-white ring-2',
              isSelected ? 'ring-holio-orange' : 'ring-transparent',
            )}
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}
        {chat.unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-holio-orange px-1 text-[9px] font-bold text-white">
            {chat.unreadCount}
          </span>
        )}
      </div>
      <span className="w-14 truncate text-center text-[10px] text-holio-muted">
        {displayName.split(' ')[0]}
      </span>
    </button>
  )
}

interface ChatListPanelProps { selectedChatId: string | null; onSelectChat: (chat: Chat) => void }

export default function ChatListPanel({ selectedChatId, onSelectChat }: ChatListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
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
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  useEffect(() => { fetchChats(activeCompany?.id) }, [fetchChats, activeCompany?.id])
  useEffect(() => { fetchStories() }, [fetchStories])

  const allChats = useMemo(() => {
    const folderFiltered = filterChats(chats)
    switch (activeNavItem) {
      case 'personal': return folderFiltered.filter((c) => c.type === 'private')
      case 'company': return folderFiltered.filter((c) => c.type === 'group')
      case 'channels': return folderFiltered.filter((c) => c.type === 'channel')
      case 'favorites': return folderFiltered.filter((c) => c.isFavourite)
      default: return folderFiltered
    }
  }, [chats, filterChats, activeNavItem])

  const favouriteChats = useMemo(
    () => allChats.filter((c) => c.isFavourite),
    [allChats],
  )

  const pinnedChats = useMemo(
    () => allChats.filter((c) => c.pinned && !favouriteChats.includes(c)),
    [allChats, favouriteChats],
  )

  const regularChats = useMemo(
    () => allChats.filter((c) => !c.pinned && !favouriteChats.includes(c)),
    [allChats, favouriteChats],
  )

  const displayedPinned = useMemo(() => {
    if (!searchQuery.trim()) return pinnedChats
    const q = searchQuery.toLowerCase()
    return pinnedChats.filter((c) => c.name?.toLowerCase().includes(q) || c.lastMessage?.content?.toLowerCase().includes(q))
  }, [pinnedChats, searchQuery])

  const displayedRegular = useMemo(() => {
    if (!searchQuery.trim()) return regularChats
    const q = searchQuery.toLowerCase()
    return regularChats.filter((c) => c.name?.toLowerCase().includes(q) || c.lastMessage?.content?.toLowerCase().includes(q))
  }, [regularChats, searchQuery])

  const isEmpty = allChats.length === 0 && !loading

  const emptyLabel: Record<string, string> = {
    personal: 'No personal chats yet',
    company: 'No group chats yet',
    channels: 'No channels yet',
    favorites: 'No favourites yet',
  }
  const emptyMessage = emptyLabel[activeNavItem] ?? 'No conversations yet'

  return (
    <div className="flex h-full w-full flex-col bg-white sm:w-80 sm:flex-shrink-0 sm:border-r sm:border-gray-100">
      {/* Always-visible search bar */}
      <div className="flex-shrink-0 px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-holio-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full bg-gray-100 py-2 pr-4 pl-9 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50"
          />
        </div>
      </div>

      <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto">
        {/* STORY section */}
        {storyGroups.length > 0 && (
          <>
            <SectionLabel>Story</SectionLabel>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {storyGroups.map((group, index) => (
                <StoryCircle
                  key={group.user.id}
                  group={group}
                  isOwn={group.user.id === currentUser?.id}
                  onClick={() => openViewer(index)}
                />
              ))}
            </div>
          </>
        )}

        {/* FAVOURITES section */}
        {favouriteChats.length > 0 && (
          <>
            <SectionLabel>Favourites</SectionLabel>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {favouriteChats.map((chat) => (
                <FavouriteCircle
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onClick={() => onSelectChat(chat)}
                />
              ))}
            </div>
          </>
        )}

        {/* Folder tabs */}
        <FolderTabs />

        {loading ? (
          <>
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
          </>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <MessageSquarePlus className="h-8 w-8 text-holio-lavender" />
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">{emptyMessage}</p>
            <p className="mt-1 text-xs text-holio-muted">Start a new chat to begin messaging</p>
          </div>
        ) : (
          <>
            {/* PINNED section */}
            {displayedPinned.length > 0 && (
              <>
                <SectionLabel>Pinned</SectionLabel>
                {displayedPinned.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() => onSelectChat(chat)}
                  />
                ))}
              </>
            )}

            {/* CHATS section */}
            {displayedRegular.length > 0 && (
              <>
                <SectionLabel>Chats</SectionLabel>
                {displayedRegular.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() => onSelectChat(chat)}
                  />
                ))}
              </>
            )}
          </>
        )}

      </div>
      <StoryViewer />
    </div>
  )
}
