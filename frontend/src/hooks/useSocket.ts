import { useEffect, useRef, useCallback } from 'react'
import { getSocket, connectSocket, disconnectSocket } from '../services/socket.service'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import { usePresenceStore } from '../stores/presenceStore'
import type { Message } from '../types'

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

    socket.on('message:delete', (data: { id: string }) => {
      removeMessage(data.id)
    })

    socket.on('typing:update', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      setTyping(data.chatId, data.userId, data.isTyping)
    })

    socket.on('presence:update', (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      updatePresence(data.userId, data.isOnline, data.lastSeen)
    })

    socket.on('message:read:update', (data: { messageId: string; readBy: string }) => {
      updateMessage(data.messageId, { isRead: true } as Partial<Message>)
    })

    return () => {
      socket.off('message:new')
      socket.off('message:edit')
      socket.off('message:delete')
      socket.off('typing:update')
      socket.off('presence:update')
      socket.off('message:read:update')
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
