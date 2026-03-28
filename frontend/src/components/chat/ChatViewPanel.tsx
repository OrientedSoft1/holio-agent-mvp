import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import DateSeparator from './DateSeparator'
import MessageInput from './MessageInput'
import InChatSearch from '../search/InChatSearch'
import TypingIndicator from './TypingIndicator'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { getSocket } from '../../services/socket.service'
import type { Chat } from '../../types'

function groupMessagesByDate(messages: { createdAt: string }[]) {
  const groups: { label: string; indices: number[] }[] = []
  let lastLabel = ''
  messages.forEach((msg, i) => {
    const date = new Date(msg.createdAt)
    const diffDays = Math.floor((new Date().getTime() - date.getTime()) / 86_400_000)
    let label: string
    if (diffDays === 0) label = 'Today'
    else if (diffDays === 1) label = 'Yesterday'
    else label = date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
    if (label !== lastLabel) { groups.push({ label, indices: [i] }); lastLabel = label }
    else groups[groups.length - 1].indices.push(i)
  })
  return groups
}

function getChatDisplayInfo(chat: Chat) {
  const isChannel = chat.type === 'channel'
  const displayName = isChannel ? `# ${chat.name ?? 'channel'}` : chat.name ?? 'Chat'
  const initials = isChannel ? '#' : displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = { private: '#6366f1', group: '#059669', channel: '#8b5cf6', bot: '#FF9220' }
  return { displayName, initials, color: colorMap[chat.type] ?? '#6366f1' }
}

export default function ChatViewPanel() {
  const activeChat = useChatStore((s) => s.activeChat)
  const messages = useChatStore((s) => s.messages)
  const messagesLoading = useChatStore((s) => s.messagesLoading)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const showInChatSearch = useUiStore((s) => s.showInChatSearch)
  const setShowInChatSearch = useUiStore((s) => s.setShowInChatSearch)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastReadRef = useRef<string | null>(null)
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight }, [messages])
  useEffect(() => {
    if (!activeChat || !messages.length || !currentUserId) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.senderId === currentUserId || lastReadRef.current === lastMsg.id) return
    lastReadRef.current = lastMsg.id
    const socket = getSocket()
    if (socket) socket.emit('message:read', { chatId: activeChat.id, messageId: lastMsg.id })
  }, [activeChat, messages, currentUserId])

  if (!activeChat) {
    return (<div className="flex flex-1 flex-col items-center justify-center bg-holio-offwhite">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-holio-lavender/30"><MessageSquare className="h-10 w-10 text-holio-lavender" /></div>
      <h3 className="mt-4 text-lg font-semibold text-holio-text">Select a chat to start messaging</h3>
      <p className="mt-1 text-sm text-holio-muted">Choose a conversation from the list</p>
    </div>)
  }

  const { displayName, initials, color } = getChatDisplayInfo(activeChat)
  const isGroupLike = activeChat.type === 'group' || activeChat.type === 'channel'
  const dateGroups = groupMessagesByDate(messages)
  const chatMembers = (activeChat as any).members as { userId: string }[] | undefined
  const otherUserId = activeChat.type === 'private' && chatMembers ? chatMembers.find((m) => m.userId !== currentUserId)?.userId : undefined
  const peerOnline = usePresenceStore((s) => otherUserId ? s.onlineUsers.has(otherUserId) : false)
  const peerLastSeen = usePresenceStore((s) => otherUserId ? s.lastSeen[otherUserId] : undefined)
  const isDM = activeChat.type === 'private'
  const isOnline = isDM ? peerOnline : false
  const statusText = isDM
    ? (peerOnline ? 'online' : (peerLastSeen ? `last seen ${new Date(peerLastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}` : ''))
    : (isGroupLike ? `${chatMembers?.length ?? 0} members` : '')

  return (
    <div className="flex flex-1 flex-col bg-holio-lavender/10">
      <ChatHeader name={displayName} avatarUrl={activeChat.avatarUrl} initials={initials} avatarColor={color} status={statusText} isOnline={isOnline} />
      {showInChatSearch && <InChatSearch chatId={activeChat.id} open={showInChatSearch} onClose={() => setShowInChatSearch(false)} />}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
        {messagesLoading && (<div className="flex justify-center py-4"><div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" /></div>)}
        {dateGroups.map((group) => (<div key={group.label}><DateSeparator label={group.label} />
          {group.indices.map((idx) => { const msg = messages[idx]; return (<MessageBubble key={msg.id} rawMessage={msg} message={{ id: msg.id, content: msg.content, timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMine: msg.senderId === currentUserId, senderName: msg.sender?.firstName, isRead: !!(msg as any).isRead || !!(msg as any).readAt, isGroup: isGroupLike, type: msg.type, fileUrl: msg.fileUrl, metadata: msg.metadata, reactions: msg.reactions, scheduledAt: msg.scheduledAt, currentUserId }} />) })}
        </div>))}
      </div>
      <TypingIndicator chatId={activeChat.id} />
      <MessageInput chatId={activeChat.id} />
    </div>
  )
}
