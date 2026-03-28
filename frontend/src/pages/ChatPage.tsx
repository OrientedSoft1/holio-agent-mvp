import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import ChatListPanel from '../components/chat/ChatListPanel'
import ChatViewPanel from '../components/chat/ChatViewPanel'
import InfoPanel from '../components/chat/InfoPanel'
import { useUiStore } from '../stores/uiStore'
import type { ChatItemData } from '../components/chat/ChatItem'

export default function ChatPage() {
  const showInfoPanel = useUiStore((s) => s.showInfoPanel)
  const [activeChat, setActiveChat] = useState<ChatItemData | null>(null)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ChatListPanel
        selectedChatId={activeChat?.id ?? null}
        onSelectChat={setActiveChat}
      />
      <ChatViewPanel activeChat={activeChat} />
      {showInfoPanel && <InfoPanel activeChat={activeChat} />}
    </div>
  )
}
