import { useEffect, useState, useMemo } from 'react'
import { Settings, Search, MessageSquarePlus } from 'lucide-react'
import ChatItem from './ChatItem'
import FolderTabs from './FolderTabs'
import { useChatStore } from '../../stores/chatStore'
import { useCompanyStore } from '../../stores/companyStore'
import { useFolderStore } from '../../stores/folderStore'
import type { Chat } from '../../types'

function ChatSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

interface ChatListPanelProps {
  selectedChatId: string | null
  onSelectChat: (chat: Chat) => void
}

export default function ChatListPanel({ selectedChatId, onSelectChat }: ChatListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const chats = useChatStore((s) => s.chats)
  const loading = useChatStore((s) => s.loading)
  const fetchChats = useChatStore((s) => s.fetchChats)
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const companyName = activeCompany?.name ?? 'Holio'
  const filterChats = useFolderStore((s) => s.filterChats)

  useEffect(() => {
    fetchChats(activeCompany?.id)
  }, [fetchChats, activeCompany?.id])

  const displayedChats = useMemo(() => {
    let result = filterChats(chats)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.lastMessage?.content.toLowerCase().includes(q),
      )
    }
    return result
  }, [chats, filterChats, searchQuery])

  return (
    <div className="flex h-screen w-80 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <h2 className="text-lg font-bold text-holio-text">{companyName}</h2>
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
            title="New chat"
          >
            <MessageSquarePlus className="h-4.5 w-4.5" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-holio-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl bg-gray-50 py-2 pr-4 pl-9 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50"
          />
        </div>
      </div>

      <FolderTabs />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
          </>
        ) : displayedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <MessageSquarePlus className="h-8 w-8 text-holio-lavender" />
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-holio-muted">
              Start a new chat to begin messaging
            </p>
          </div>
        ) : (
          displayedChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  )
}
