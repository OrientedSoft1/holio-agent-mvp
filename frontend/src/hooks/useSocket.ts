import { useEffect, useRef, useCallback } from 'react'
import { getSocket, connectSocket, disconnectSocket } from '../services/socket.service'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import { usePresenceStore } from '../stores/presenceStore'
import type { Message, Chat, MessageReaction } from '../types'

export function useSocket() {
  const token = useAuthStore((s) => s.accessToken)
  const activeChat = useChatStore((s) => s.activeChat)
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const removeMessage = useChatStore((s) => s.removeMessage)
  const setTyping = useChatStore((s) => s.setTyping)
  const updatePresence = usePresenceStore((s) => s.updatePresence)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const joinedChatRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)

    socket.on('message:new', (message: Message) => {
      addMessage(message)
    })

    socket.on('message:edit', (data: { id: string } & Partial<Message>) => {
      updateMessage(data.id, data)
    })

    socket.on('message:delete', (data: { messageId: string }) => {
      removeMessage(data.messageId)
    })

    socket.on('typing:update', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      setTyping(data.chatId, data.userId, data.isTyping)
    })

    socket.on('presence:update', (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      updatePresence(data.userId, data.isOnline, data.lastSeen)
    })

    socket.on('message:status', (data: { messageId?: string; chatId?: string; messageIds?: string[]; status: string }) => {
      if (data.status === 'read') {
        if (data.messageIds) {
          data.messageIds.forEach((mid) => updateMessage(mid, { isRead: true } as Partial<Message>))
        } else if (data.messageId) {
          updateMessage(data.messageId, { isRead: true } as Partial<Message>)
        }
      }
    })

    socket.on('chat:update', (data: Partial<Chat> & { id: string }) => {
      const chats = useChatStore.getState().chats
      const updated = chats.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      useChatStore.setState({ chats: updated })
      const active = useChatStore.getState().activeChat
      if (active?.id === data.id) {
        useChatStore.setState({ activeChat: { ...active, ...data } })
      }
    })

    socket.on('reaction:update', (data: { messageId: string; reactions?: MessageReaction[]; userId?: string; emoji?: string; action?: string }) => {
      if (data.reactions) {
        updateMessage(data.messageId, { reactions: data.reactions } as Partial<Message>)
      } else if (data.emoji && data.userId && data.action) {
        const msgs = useChatStore.getState().messages
        const msg = msgs.find((m) => m.id === data.messageId)
        if (msg) {
          const prev = msg.reactions ?? []
          let next: MessageReaction[]
          if (data.action === 'removed') {
            next = prev.map((r) =>
              r.emoji === data.emoji ? { ...r, count: r.count - 1 } : r
            ).filter((r) => r.count > 0)
          } else {
            const existing = prev.find((r) => r.emoji === data.emoji)
            if (existing) {
              next = prev.map((r) =>
                r.emoji === data.emoji ? { ...r, count: r.count + 1 } : r
              )
            } else {
              next = [...prev, { emoji: data.emoji, count: 1, reacted: false }]
            }
          }
          updateMessage(data.messageId, { reactions: next } as Partial<Message>)
        }
      }
    })

    socket.on('bot:response', (message: Message) => {
      addMessage(message)
    })

    socket.on('message:pin', (data: { messageId: string; isPinned: boolean }) => {
      updateMessage(data.messageId, { isPinned: data.isPinned } as Partial<Message>)
    })

    socket.on('poll:update', (data: { pollId: string; results: unknown }) => {
      const msgs = useChatStore.getState().messages
      const msg = msgs.find((m) => m.metadata?.poll?.id === data.pollId)
      if (msg && msg.metadata) {
        updateMessage(msg.id, {
          metadata: { ...msg.metadata, poll: { ...msg.metadata.poll, ...data.results } },
        } as Partial<Message>)
      }
    })

    socket.on('connect', () => {
      const chatId = joinedChatRef.current
      if (chatId) {
        socket.emit('chat:join', { chatId })
      }
    })

    return () => {
      socket.off('message:new')
      socket.off('message:edit')
      socket.off('message:delete')
      socket.off('typing:update')
      socket.off('presence:update')
      socket.off('message:status')
      socket.off('chat:update')
      socket.off('reaction:update')
      socket.off('bot:response')
      socket.off('message:pin')
      socket.off('poll:update')
      socket.off('connect')
      disconnectSocket()
    }
  }, [token, addMessage, updateMessage, removeMessage, setTyping, updatePresence])

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !activeChat) return

    if (joinedChatRef.current && joinedChatRef.current !== activeChat.id) {
      socket.emit('chat:leave', { chatId: joinedChatRef.current })
    }

    socket.emit('chat:join', { chatId: activeChat.id })
    joinedChatRef.current = activeChat.id

    return () => {
      if (joinedChatRef.current) {
        socket.emit('chat:leave', { chatId: joinedChatRef.current })
        joinedChatRef.current = null
      }
    }
  }, [activeChat])

  const emitTyping = useCallback(() => {
    const socket = getSocket()
    const chatId = useChatStore.getState().activeChat?.id
    if (!socket || !chatId) return

    socket.emit('typing:start', { chatId })

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { chatId })
    }, 2000)
  }, [])

  const emitRead = useCallback((chatId: string, messageId: string) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('message:read', { chatId, messageId })
  }, [])

  return { emitTyping, emitRead }
}
