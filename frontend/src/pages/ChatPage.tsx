import Sidebar from '../components/layout/Sidebar'
import ChatListPanel from '../components/chat/ChatListPanel'
import ChatViewPanel from '../components/chat/ChatViewPanel'
import InfoPanel from '../components/chat/InfoPanel'
import { useUiStore } from '../stores/uiStore'
import { useChatStore } from '../stores/chatStore'
import { useSocket } from '../hooks/useSocket'
import type { Chat } from '../types'

export default function ChatPage() {
  const showInfoPanel = useUiStore((s) => s.showInfoPanel)
  const activeChat = useChatStore((s) => s.activeChat)
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const fetchMessages = useChatStore((s) => s.fetchMessages)

  useSocket()

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat)
    fetchMessages(chat.id)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ChatListPanel
        selectedChatId={activeChat?.id ?? null}
        onSelectChat={handleSelectChat}
      />
      <ChatViewPanel />
      {showInfoPanel && <InfoPanel />}
    </div>
  )
}
