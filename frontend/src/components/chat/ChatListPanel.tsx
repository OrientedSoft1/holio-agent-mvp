import { useState } from 'react'
import { Settings, Search } from 'lucide-react'
import ChatItem, { type ChatItemData } from './ChatItem'
import { useCompanyStore } from '../../stores/companyStore'
import { cn } from '../../lib/utils'

const MOCK_CHATS: ChatItemData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    initials: 'SJ',
    avatarColor: '#6366f1',
    lastMessage: 'Can you review the latest designs?',
    timestamp: '2:14 PM',
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    isOnline: true,
    isGroup: false,
    isChannel: false,
  },
  {
    id: '2',
    name: 'Marketing Team',
    initials: 'MT',
    avatarColor: '#059669',
    lastMessage: 'Alex: Campaign results look promising!',
    timestamp: '1:45 PM',
    unreadCount: 5,
    isPinned: false,
    isMuted: false,
    isOnline: false,
    isGroup: true,
    isChannel: false,
  },
  {
    id: '3',
    name: '#general',
    initials: '#',
    avatarColor: '#8b5cf6',
    lastMessage: 'Welcome to the team!',
    timestamp: '12:30 PM',
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    isOnline: false,
    isGroup: false,
    isChannel: true,
  },
  {
    id: '4',
    name: 'David Chen',
    initials: 'DC',
    avatarColor: '#f59e0b',
    lastMessage: 'The API integration is complete',
    timestamp: '11:20 AM',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    isGroup: false,
    isChannel: false,
  },
  {
    id: '5',
    name: 'Emily Watson',
    initials: 'EW',
    avatarColor: '#ec4899',
    lastMessage: 'Thanks for the update!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isOnline: false,
    isGroup: false,
    isChannel: false,
  },
  {
    id: '6',
    name: '#product-updates',
    initials: '#',
    avatarColor: '#0ea5e9',
    lastMessage: 'v2.4.0 release notes published',
    timestamp: 'Yesterday',
    unreadCount: 12,
    isPinned: false,
    isMuted: false,
    isOnline: false,
    isGroup: false,
    isChannel: true,
  },
  {
    id: '7',
    name: 'Holio Assistant',
    initials: 'HA',
    avatarColor: '#FF9220',
    lastMessage: 'Here are the quarterly summaries...',
    timestamp: 'Mon',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    isGroup: false,
    isChannel: false,
  },
]

const FOLDER_TABS = ['All Chats', 'Personal', 'Work', 'Archived']

interface ChatListPanelProps {
  selectedChatId: string | null
  onSelectChat: (chat: ChatItemData) => void
}

export default function ChatListPanel({ selectedChatId, onSelectChat }: ChatListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All Chats')
  const companyName = useCompanyStore((s) => s.activeCompany?.name ?? 'Holio')

  const filteredChats = MOCK_CHATS.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen w-80 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <h2 className="text-lg font-bold text-holio-text">{companyName}</h2>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
          <Settings className="h-4.5 w-4.5" />
        </button>
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

      <div className="flex gap-1 overflow-x-auto px-3 pb-2">
        {FOLDER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab
                ? 'bg-holio-orange text-white'
                : 'text-holio-muted hover:bg-gray-50 hover:text-holio-text',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChatId === chat.id}
            onClick={() => onSelectChat(chat)}
          />
        ))}
      </div>
    </div>
  )
}
