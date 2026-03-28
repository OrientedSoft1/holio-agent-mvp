import { useState, useRef, useCallback, useMemo, type KeyboardEvent } from 'react'
import {
  Paperclip,
  Smile,
  Mic,
  Send,
  ImageIcon,
  Bot,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
} from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useBotStore } from '../../stores/botStore'
import VoiceRecorder from '../messages/VoiceRecorder'
import GifPicker from './GifPicker'
import AttachMenu from './AttachMenu'
import api from '../../services/api.service'
import { cn } from '../../lib/utils'

interface MessageInputProps {
  chatId: string
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

export default function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const companyBots = useBotStore((s) => s.companyBots)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const filteredBots = useMemo(() => {
    if (!mentionQuery) return companyBots
    const q = mentionQuery.toLowerCase()
    return companyBots.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q),
    )
  }, [companyBots, mentionQuery])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText('')
    setShowMentionMenu(false)
    try {
      await sendMessage(chatId, trimmed)
    } catch {
      setText(trimmed)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
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
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`

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

  const handleAttachSelect = useCallback((type: 'photo' | 'document' | 'contact' | 'location') => {
    if (type === 'photo') {
      photoInputRef.current?.click()
    } else if (type === 'document') {
      docInputRef.current?.click()
    }
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, messageType: 'image' | 'file') => {
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
    <div className="relative flex items-end gap-2 border-t border-gray-100 bg-white p-3">
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
        {/* @mention dropdown */}
        {showMentionMenu && filteredBots.length > 0 && (
          <div className="absolute bottom-full left-0 z-10 mb-1 w-64 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
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
                      : 'hover:bg-gray-50',
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

        {/* Overlay for styled @mentions (hidden, just for visual rendering) */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-2.5 text-sm text-transparent"
          aria-hidden
        >
          {renderStyledText()}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (type @ to mention a bot)"
          rows={1}
          className="w-full resize-none rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50"
          style={{ maxHeight: 120 }}
        />
      </div>

      <button
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
      >
        <Smile className="h-5 w-5" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowGifPicker(!showGifPicker)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        {showGifPicker && (
          <GifPicker
            onSelect={handleGifSelect}
            onClose={() => setShowGifPicker(false)}
          />
        )}
      </div>

      {text.trim() ? (
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={() => setRecording(true)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <Mic className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
