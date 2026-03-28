import Sidebar from '../components/layout/Sidebar'
import ChatListPanel from '../components/chat/ChatListPanel'
import ChatViewPanel from '../components/chat/ChatViewPanel'
import InfoPanel from '../components/chat/InfoPanel'
import ResizablePanel from '../components/layout/ResizablePanel'
import { useUiStore } from '../stores/uiStore'
import { useChatStore } from '../stores/chatStore'
import { useSocket } from '../hooks/useSocket'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { Chat } from '../types'

export default function ChatPage() {
  const showInfoPanel = useUiStore((s) => s.showInfoPanel)
  const darkMode = useUiStore((s) => s.darkMode)
  const chatListWidth = useUiStore((s) => s.chatListWidth)
  const infoPanelWidth = useUiStore((s) => s.infoPanelWidth)
  const setChatListWidth = useUiStore((s) => s.setChatListWidth)
  const setInfoPanelWidth = useUiStore((s) => s.setInfoPanelWidth)
  const activeChat = useChatStore((s) => s.activeChat)
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const fetchMessages = useChatStore((s) => s.fetchMessages)

  useSocket()
  useKeyboardShortcuts()

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat)
    fetchMessages(chat.id)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-holio-offwhite">
        <Sidebar />
        <ResizablePanel
          width={chatListWidth}
          minWidth={240}
          maxWidth={400}
          onResize={setChatListWidth}
          side="left"
        >
          <ChatListPanel
            selectedChatId={activeChat?.id ?? null}
            onSelectChat={handleSelectChat}
          />
        </ResizablePanel>
        <ChatViewPanel />
        {showInfoPanel && (
          <ResizablePanel
            width={infoPanelWidth}
            minWidth={240}
            maxWidth={400}
            onResize={setInfoPanelWidth}
            side="right"
          >
            <InfoPanel />
          </ResizablePanel>
        )}
      </div>
    </div>
  )
}
