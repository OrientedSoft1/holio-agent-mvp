import { MessageSquare } from 'lucide-react'
import ChatHeader from './ChatHeader'
import MessageBubble, { type MessageData } from './MessageBubble'
import DateSeparator from './DateSeparator'
import MessageInput from './MessageInput'
import type { ChatItemData } from './ChatItem'

const MOCK_MESSAGES: MessageData[] = [
  {
    id: 'm1',
    content: 'Hey! How is the project going?',
    timestamp: '10:30 AM',
    isMine: false,
    senderName: 'Sarah Johnson',
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm2',
    content: 'Going great! We finished the backend APIs yesterday.',
    timestamp: '10:32 AM',
    isMine: true,
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm3',
    content: 'That is awesome! Can you share the documentation?',
    timestamp: '10:33 AM',
    isMine: false,
    senderName: 'Sarah Johnson',
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm4',
    content: 'Sure, I will send it over right now. We also added WebSocket support for real-time messaging.',
    timestamp: '10:35 AM',
    isMine: true,
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm5',
    content: 'Perfect! The frontend team has been waiting for that. We can start integrating the chat UI next week.',
    timestamp: '10:36 AM',
    isMine: false,
    senderName: 'Sarah Johnson',
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm6',
    content: 'Sounds like a plan. Let me know if you need any help with the Socket.IO setup on the client side.',
    timestamp: '10:38 AM',
    isMine: true,
    isRead: true,
    isGroup: false,
  },
  {
    id: 'm7',
    content: 'Will do! Also, can you review the latest designs? I uploaded them to Figma.',
    timestamp: '2:14 PM',
    isMine: false,
    senderName: 'Sarah Johnson',
    isRead: true,
    isGroup: false,
  },
]

interface ChatViewPanelProps {
  activeChat: ChatItemData | null
}

export default function ChatViewPanel({ activeChat }: ChatViewPanelProps) {
  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-holio-offwhite">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/30">
          <MessageSquare className="h-10 w-10 text-holio-lavender" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-holio-text">
          Select a chat to start messaging
        </h3>
        <p className="mt-1 text-sm text-holio-muted">
          Choose a conversation from the list
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-holio-offwhite">
      <ChatHeader
        name={activeChat.name}
        avatarUrl={activeChat.avatarUrl}
        initials={activeChat.initials}
        avatarColor={activeChat.avatarColor}
        status={activeChat.isOnline ? 'online' : 'last seen recently'}
        isOnline={activeChat.isOnline}
      />

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-4">
        <DateSeparator label="Today" />
        {MOCK_MESSAGES.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <MessageInput />
    </div>
  )
}
