import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { Search, Plus, MessageSquarePlus } from 'lucide-react'
import ChatItem from './ChatItem'
import FolderTabs from './FolderTabs'
import StoryCircle from '../stories/StoryCircle'
import StoryViewer from '../stories/StoryViewer'
import { useChatStore } from '../../stores/chatStore'
import { useCompanyStore } from '../../stores/companyStore'
import { useFolderStore } from '../../stores/folderStore'
import { useStoryStore } from '../../stores/storyStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import type { Chat } from '../../types'

type FilterTab = 'all' | 'groups' | 'channels' | 'bots'
const FILTER_TABS: { key: FilterTab; label: string; chatType?: Chat['type'] }[] = [
  { key: 'all', label: 'All' }, { key: 'groups', label: 'Groups', chatType: 'group' },
  { key: 'channels', label: 'Channels', chatType: 'channel' }, { key: 'bots', label: 'Bots', chatType: 'bot' },
]

function ChatSkeleton() {
  return (<div className="flex items-center gap-3 px-4 py-2.5"><div className="h-[54px] w-[54px] flex-shrink-0 animate-pulse rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="flex items-center justify-between"><div className="h-4 w-28 animate-pulse rounded bg-gray-200" /><div className="h-3.5 w-10 animate-pulse rounded bg-gray-100" /></div><div className="h-3.5 w-40 animate-pulse rounded bg-gray-100" /></div></div>)
}

interface ChatListPanelProps { selectedChatId: string | null; onSelectChat: (chat: Chat) => void }

export default function ChatListPanel({ selectedChatId, onSelectChat }: ChatListPanelProps) {
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
  const rafRef = useRef<number>(0)
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollContainerRef.current
      if (el) setScrolled(el.scrollTop > 80)
    })
  }, [])
  useEffect(() => { return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) } }, [])
  const tabCounts = useMemo(() => { const f = filterChats(chats); return { all: f.length, groups: f.filter((c) => c.type === 'group').length, channels: f.filter((c) => c.type === 'channel').length, bots: f.filter((c) => c.type === 'bot').length } }, [chats, filterChats])
  const displayedChats = useMemo(() => {
    let result = filterChats(chats)
    if (activeTab !== 'all') { const tab = FILTER_TABS.find((t) => t.key === activeTab); if (tab?.chatType) result = result.filter((c) => c.type === tab.chatType) }
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); result = result.filter((c) => c.name?.toLowerCase().includes(q) || c.lastMessage?.content.toLowerCase().includes(q)) }
    return result
  }, [chats, filterChats, searchQuery, activeTab])

  return (
    <div className="flex h-full w-full flex-col bg-white sm:w-80 sm:flex-shrink-0 sm:border-r sm:border-gray-100">
      <div className={cn('flex flex-shrink-0 items-center justify-between px-4 transition-all duration-300 ease-in-out will-change-[height]', scrolled ? 'h-11' : 'h-14')}>
        <h1 className={cn('font-bold leading-tight text-holio-text transition-all duration-300 ease-in-out', scrolled ? 'text-lg' : 'text-xl')}>Chats</h1>
        <button onClick={() => setShowSearch((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text" title="Search"><Search className="h-5 w-5" /></button>
      </div>
      {showSearch && (<div className="px-4 pb-2"><div className="relative"><Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-holio-muted" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full rounded-xl bg-gray-50 py-2 pr-4 pl-9 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50" autoFocus /></div></div>)}
      <div className={cn('overflow-hidden transition-all duration-300 ease-in-out will-change-[max-height,opacity]', scrolled ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100')}>
        {storyGroups.length > 0 && (<div className="flex gap-3 overflow-x-auto px-4 py-2 scrollbar-none">{storyGroups.map((group, index) => (<StoryCircle key={group.user.id} group={group} isOwn={group.user.id === currentUser?.id} onClick={() => openViewer(index)} />))}</div>)}
      </div>
      <div className={cn('sticky top-0 z-10 bg-white transition-shadow duration-300 ease-in-out', scrolled ? 'shadow-sm' : 'shadow-none')}>
        <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
          {FILTER_TABS.map((tab) => { const isActive = activeTab === tab.key; const count = tabCounts[tab.key as keyof typeof tabCounts]; return (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2 pt-1.5 text-[14px] font-medium transition-colors', isActive ? 'border-holio-orange text-holio-orange' : 'border-transparent text-holio-muted hover:text-holio-text')}>{tab.label}{count !== undefined && count > 0 && (<span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none', isActive ? 'bg-holio-orange/15 text-holio-orange' : 'bg-gray-200/60 text-holio-muted')}>{count}</span>)}</button>) })}
        </div>
        <div className="h-px bg-gray-100" />
      </div>
      <FolderTabs />
      <div ref={scrollContainerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto scrollbar-none">
        {loading ? (<><ChatSkeleton /><ChatSkeleton /><ChatSkeleton /><ChatSkeleton /><ChatSkeleton /></>) : displayedChats.length === 0 ? (<div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20"><MessageSquarePlus className="h-8 w-8 text-holio-lavender" /></div><p className="mt-4 text-sm font-medium text-holio-text">No conversations yet</p><p className="mt-1 text-xs text-holio-muted">Start a new chat to begin messaging</p></div>) : displayedChats.map((chat) => (<ChatItem key={chat.id} chat={chat} isSelected={selectedChatId === chat.id} onClick={() => onSelectChat(chat)} />))}
        <button className="absolute right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-holio-orange shadow-lg transition-transform hover:scale-105 active:scale-95" title="New chat"><Plus className="h-6 w-6 text-white" /></button>
      </div>
      <StoryViewer />
    </div>
  )
}
