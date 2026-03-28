import Sidebar from '../components/layout/Sidebar'
import BottomNavBar from '../components/layout/BottomNavBar'
import FloatingActionButton from '../components/layout/FloatingActionButton'
import ChatListPanel from '../components/chat/ChatListPanel'
import ChatViewPanel from '../components/chat/ChatViewPanel'
import InfoPanel from '../components/chat/InfoPanel'
import ContactsPanel from '../components/chat/ContactsPanel'
import ResizablePanel from '../components/layout/ResizablePanel'
import GlobalSearch from '../components/search/GlobalSearch'
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
  const activeNavItem = useUiStore((s) => s.activeNavItem)
  const setActiveNavItem = useUiStore((s) => s.setActiveNavItem)
  const showGlobalSearch = useUiStore((s) => s.showGlobalSearch)
  const setShowGlobalSearch = useUiStore((s) => s.setShowGlobalSearch)
  const activeChat = useChatStore((s) => s.activeChat)
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const fetchMessages = useChatStore((s) => s.fetchMessages)

  useSocket()
  useKeyboardShortcuts()

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat)
    fetchMessages(chat.id)
  }

  const handleContactStartChat = (chatId: string) => {
    const chats = useChatStore.getState().chats
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      handleSelectChat(chat)
      setActiveNavItem('all')
    }
  }

  const handleSearchSelectChat = (chatId: string) => {
    const chats = useChatStore.getState().chats
    const chat = chats.find((c) => c.id === chatId)
    if (chat) handleSelectChat(chat)
  }

  const isContactsView = activeNavItem === 'contacts'

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-holio-offwhite">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <ResizablePanel
          width={chatListWidth}
          minWidth={240}
          maxWidth={400}
          onResize={setChatListWidth}
          side="left"
        >
          {isContactsView ? (
            <ContactsPanel onStartChat={handleContactStartChat} />
          ) : (
            <ChatListPanel
              selectedChatId={activeChat?.id ?? null}
              onSelectChat={handleSelectChat}
            />
          )}
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
      <FloatingActionButton />
      <BottomNavBar />
      <GlobalSearch
        open={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onSelectChat={handleSearchSelectChat}
      />
    </div>
  )
}
