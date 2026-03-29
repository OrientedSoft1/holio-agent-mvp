import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FloatingActionButton from '../components/layout/FloatingActionButton'
import ChatListPanel from '../components/chat/ChatListPanel'
import ChatViewPanel from '../components/chat/ChatViewPanel'
import InfoPanel from '../components/chat/InfoPanel'
import ContactsPanel from '../components/chat/ContactsPanel'
import BotsPanel from '../components/bots/BotsPanel'
import StoriesPanel from '../components/stories/StoriesPanel'
import ResizablePanel from '../components/layout/ResizablePanel'
import GlobalSearch from '../components/search/GlobalSearch'
import NewChatModal from '../components/chat/NewChatModal'
import NewGroupModal from '../components/chat/NewGroupModal'
import NewChannelModal from '../components/chat/NewChannelModal'
import { useUiStore } from '../stores/uiStore'
import { useChatStore } from '../stores/chatStore'
import { useContactsStore } from '../stores/contactsStore'
import api from '../services/api.service'
import { useSocket } from '../hooks/useSocket'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { Chat } from '../types'

function SecretChatPicker({ onClose, onCreated }: { onClose: () => void; onCreated: (chatId: string) => void }) {
  const contacts = useContactsStore((s) => s.contacts)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSelect = async (contactUserId: string) => {
    setCreating(true)
    try {
      const { data } = await api.post<Chat>('/chats/secret', { targetUserId: contactUserId })
      onCreated(data.id)
      onClose()
    } catch {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-holio-text">New Secret Chat</h3>
          <button onClick={onClose} className="text-holio-muted hover:text-holio-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {contacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-holio-muted">No contacts yet</p>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.contactUserId)}
                disabled={creating}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-text">
                  {c.contactUser.firstName[0]}
                  {c.contactUser.lastName?.[0] ?? ''}
                </div>
                <span className="text-sm font-medium text-holio-text">
                  {c.contactUser.firstName} {c.contactUser.lastName ?? ''}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const showInfoPanel = useUiStore((s) => s.showInfoPanel)
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

  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showSecretChat, setShowSecretChat] = useState(false)

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

  const handleBotStartChat = (chatId: string) => {
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

  const handleChatCreated = (chatId: string) => {
    const chats = useChatStore.getState().chats
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      handleSelectChat(chat)
      setActiveNavItem('all')
    }
  }

  const leftPanel = (() => {
    switch (activeNavItem) {
      case 'contacts':
        return <ContactsPanel onStartChat={handleContactStartChat} />
      case 'bots':
        return <BotsPanel onSelectBotChat={handleBotStartChat} />
      case 'stories':
        return <StoriesPanel />
      default:
        return (
          <ChatListPanel
            selectedChatId={activeChat?.id ?? null}
            onSelectChat={handleSelectChat}
          />
        )
    }
  })()

  return (
    <>
      <div className="flex h-full overflow-hidden">
        <ResizablePanel
          width={chatListWidth}
          minWidth={240}
          maxWidth={400}
          onResize={setChatListWidth}
          side="left"
        >
          {leftPanel}
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
      <FloatingActionButton
        onNewChat={() => setShowNewChat(true)}
        onNewSecretChat={() => setShowSecretChat(true)}
        onNewGroup={() => setShowNewGroup(true)}
        onNewChannel={() => setShowNewChannel(true)}
      />
      <GlobalSearch
        open={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onSelectChat={handleSearchSelectChat}
      />
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatCreated={handleChatCreated}
      />
      <NewGroupModal
        open={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        onChatCreated={handleChatCreated}
      />
      <NewChannelModal
        open={showNewChannel}
        onClose={() => setShowNewChannel(false)}
        onChatCreated={handleChatCreated}
      />
      {showSecretChat && (
        <SecretChatPicker
          onClose={() => setShowSecretChat(false)}
          onCreated={handleChatCreated}
        />
      )}
    </>
  )
}
