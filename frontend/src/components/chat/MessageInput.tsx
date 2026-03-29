import { useState, useRef, useCallback, useMemo, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'
import {
  Paperclip,
  Smile,
  Mic,
  Send,
  Bot,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
  Clock,
  X,
  Reply,
  Pencil,
} from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useBotStore } from '../../stores/botStore'
import VoiceRecorder from '../messages/VoiceRecorder'
import GifPicker from './GifPicker'
import AttachMenu from './AttachMenu'
import EmojiPicker from './EmojiPicker'
import CreatePollModal from './CreatePollModal'
import api from '../../services/api.service'
import { getSocket } from '../../services/socket.service'
import { cn } from '../../lib/utils'

interface MessageInputProps {
  chatId: string
  onTyping?: () => void
}

const BOT_TYPE_ICON: Record<string, typeof Bot> = {
  cfo: DollarSign,
  marketing: Megaphone,
  hr: Users,
  support: Headphones,
  devops: Server,
  custom: Bot,
}

const BOT_TYPE_COLOR: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  custom: 'bg-holio-dark',
}

export default function MessageInput({ chatId, onTyping }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showPollModal, setShowPollModal] = useState(false)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const replyToMessage = useChatStore((s) => s.replyToMessage)
  const editingMessage = useChatStore((s) => s.editingMessage)
  const setReplyTo = useChatStore((s) => s.setReplyTo)
  const setEditing = useChatStore((s) => s.setEditing)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const companyBots = useBotStore((s) => s.companyBots)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredBots = useMemo(() => {
    if (!mentionQuery) return companyBots
    const q = mentionQuery.toLowerCase()
    return companyBots.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q),
    )
  }, [companyBots, mentionQuery])

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content ?? '')
      textareaRef.current?.focus()
    }
  }, [editingMessage])

  const handleSend = async (scheduledAt?: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setShowMentionMenu(false)
    setShowSchedule(false)
    try {
      if (editingMessage) {
        await api.patch(`/messages/${editingMessage.id}`, { content: trimmed })
        updateMessage(editingMessage.id, { content: trimmed, isEdited: true })
        setEditing(null)
      } else {
        const extra: Record<string, unknown> = {}
        if (replyToMessage) extra.replyToId = replyToMessage.id
        if (scheduledAt) extra.metadata = { scheduledAt }
        await sendMessage(chatId, trimmed, 'text', extra)
        setReplyTo(null)
      }
    } catch {
      setText(trimmed)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleScheduleSend = () => {
    if (!scheduleDate || !scheduleTime) return
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
    handleSend(scheduledAt)
    setScheduleDate('')
    setScheduleTime('')
  }

  const insertMention = useCallback(
    (botName: string) => {
      const el = textareaRef.current
      if (!el) return
      const cursorPos = el.selectionStart
      const before = text.slice(0, cursorPos)
      const after = text.slice(cursorPos)
      const atIdx = before.lastIndexOf('@')
      if (atIdx === -1) return
      const newText = before.slice(0, atIdx) + `@${botName} ` + after
      setText(newText)
      setShowMentionMenu(false)
      setMentionQuery('')
      setTimeout(() => {
        const newPos = atIdx + botName.length + 2
        el.selectionStart = newPos
        el.selectionEnd = newPos
        el.focus()
      }, 0)
    },
    [text],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionMenu && filteredBots.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex((i) => (i + 1) % filteredBots.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex((i) =>
          i === 0 ? filteredBots.length - 1 : i - 1,
        )
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredBots[mentionIndex].name)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionMenu(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }

    if (e.key === 'Escape') {
      if (editingMessage) { setEditing(null); setText('') }
      else if (replyToMessage) setReplyTo(null)
    }
  }

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`

    const socket = getSocket()
    if (socket) {
      socket.emit('typing:start', { chatId })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { chatId })
      }, 2000)
    }

    const cursorPos = el.selectionStart
    const before = newText.slice(0, cursorPos)
    const atMatch = before.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1])
      setShowMentionMenu(true)
      setMentionIndex(0)
    } else {
      setShowMentionMenu(false)
    }
  }

  const handleEmojiSelect = useCallback((emoji: string) => {
    const el = textareaRef.current
    if (!el) {
      setText((prev) => prev + emoji)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = text.slice(0, start)
    const after = text.slice(end)
    const newText = before + emoji + after
    setText(newText)
    setTimeout(() => {
      const newPos = start + emoji.length
      el.selectionStart = newPos
      el.selectionEnd = newPos
      el.focus()
    }, 0)
  }, [text])

  const uploadFile = useCallback(async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ url: string }>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }, [])

  const handleVoiceSend = useCallback(async (blob: Blob, durationSec: number) => {
    setRecording(false)
    try {
      const file = new File([blob], 'voice.webm', { type: 'audio/webm' })
      const { url } = await uploadFile(file)
      await sendMessage(chatId, '', 'voice', {
        fileUrl: url,
        metadata: { duration: durationSec },
      })
    } catch {
      // upload failed silently
    }
  }, [chatId, sendMessage, uploadFile])

  const handleGifSelect = useCallback(async (gifUrl: string) => {
    setShowGifPicker(false)
    try {
      await sendMessage(chatId, '', 'gif', { fileUrl: gifUrl })
    } catch {
      // send failed silently
    }
  }, [chatId, sendMessage])

  const handleAttachSelect = useCallback((type: 'photo' | 'document' | 'contact' | 'location' | 'poll') => {
    if (type === 'photo') {
      photoInputRef.current?.click()
    } else if (type === 'document') {
      docInputRef.current?.click()
    } else if (type === 'poll') {
      setShowPollModal(true)
    } else if (type === 'contact') {
      window.alert('Contact sharing is coming soon')
    } else if (type === 'location') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const content = `\u{1F4CD} Location: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
            try {
              await sendMessage(chatId, content, 'text', {
                metadata: { type: 'location', lat: pos.coords.latitude, lng: pos.coords.longitude },
              })
            } catch {
              // send failed silently
            }
          },
          () => window.alert('Unable to get your location'),
        )
      } else {
        window.alert('Geolocation is not supported by your browser')
      }
    }
  }, [chatId, sendMessage])

  const handleCreatePoll = useCallback(async (poll: {
    question: string; options: string[]; allowMultiple: boolean; anonymous: boolean; quizMode: boolean; correctOption?: number
  }) => {
    try {
      await api.post('/polls', { chatId, ...poll })
    } catch { /* silent */ }
  }, [chatId])

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>, messageType: 'image' | 'file') => {
    const files = e.target.files
    if (!files || files.length === 0) return
    e.target.value = ''

    try {
      const file = files[0]
      const { url } = await uploadFile(file)
      const meta = { files: [{ name: file.name, size: file.size, mimeType: file.type, url }] }
      await sendMessage(chatId, '', messageType, { fileUrl: url, metadata: meta })
    } catch {
      // upload failed silently
    }
  }, [chatId, sendMessage, uploadFile])

  const renderStyledText = () => {
    if (!text) return null
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="font-bold text-blue-600">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
  }

  if (recording) {
    return (
      <VoiceRecorder
        onSend={handleVoiceSend}
        onCancel={() => setRecording(false)}
      />
    )
  }

  return (
    <div className="relative border-t border-gray-100 bg-white px-1 dark:bg-[#152022] dark:border-[#1E3035]">
      {replyToMessage && (
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 dark:border-[#1E3035]">
          <Reply className="h-4 w-4 text-holio-orange" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-holio-orange">
              Reply to {replyToMessage.sender?.firstName ?? 'message'}
            </p>
            <p className="truncate text-xs text-holio-muted">
              {replyToMessage.content}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-holio-muted hover:text-holio-text">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {editingMessage && (
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 dark:border-[#1E3035]">
          <Pencil className="h-4 w-4 text-holio-orange" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-holio-orange">Editing message</p>
            <p className="truncate text-xs text-holio-muted">
              {editingMessage.content}
            </p>
          </div>
          <button onClick={() => { setEditing(null); setText('') }} className="text-holio-muted hover:text-holio-text">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'file')}
      />

      <div className="relative">
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        {showAttachMenu && (
          <AttachMenu
            onSelect={handleAttachSelect}
            onClose={() => setShowAttachMenu(false)}
          />
        )}
      </div>

      <div className="relative flex-1">
        {showMentionMenu && filteredBots.length > 0 && (
          <div className="absolute bottom-full left-0 z-10 mb-1 w-64 rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {filteredBots.map((bot, idx) => {
              const Icon = BOT_TYPE_ICON[bot.type] ?? Bot
              const color = BOT_TYPE_COLOR[bot.type] ?? BOT_TYPE_COLOR.custom
              return (
                <button
                  key={bot.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(bot.name)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                    idx === mentionIndex
                      ? 'bg-holio-lavender/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                      color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-holio-text">
                      {bot.name}
                    </p>
                    <p className="truncate text-[11px] capitalize text-holio-muted">
                      {bot.type}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {showGifPicker && (
          <GifPicker
            onSelect={handleGifSelect}
            onClose={() => setShowGifPicker(false)}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-full px-4 py-2.5 text-sm text-transparent"
          aria-hidden
        >
          {renderStyledText()}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          className="w-full resize-none rounded-full bg-gray-100 px-4 py-2.5 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50 dark:bg-[#1A2A2D] dark:text-white"
          style={{ maxHeight: 120 }}
        />
      </div>

      <div className="relative">
        <button
          onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false) }}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <Smile className="h-5 w-5" />
        </button>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={(emoji) => {
              handleEmojiSelect(emoji)
              setShowEmojiPicker(false)
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>

      <button
        onClick={() => setRecording(true)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
      >
        <Mic className="h-5 w-5" />
      </button>

      <div className="relative">
        <button
          onClick={() => handleSend()}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowSchedule(!showSchedule)
          }}
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
        {showSchedule && (
          <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-holio-text">
                <Clock className="h-4 w-4 text-holio-orange" />
                Schedule Message
              </div>
              <button onClick={() => setShowSchedule(false)} className="text-holio-muted hover:text-holio-text">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mb-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-holio-text outline-none focus:border-holio-orange dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-holio-text outline-none focus:border-holio-orange dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleScheduleSend}
              disabled={!scheduleDate || !scheduleTime}
              className="w-full rounded-lg bg-holio-orange py-2 text-xs font-medium text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
            >
              Schedule
            </button>
          </div>
        )}
      </div>
      </div>
      <CreatePollModal open={showPollModal} onClose={() => setShowPollModal(false)} onCreatePoll={handleCreatePoll} />
    </div>
  )
}
