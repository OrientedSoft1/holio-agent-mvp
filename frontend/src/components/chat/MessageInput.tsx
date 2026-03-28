import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Paperclip, Smile, Mic, Send, ImageIcon } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import VoiceRecorder from '../messages/VoiceRecorder'
import GifPicker from './GifPicker'
import AttachMenu from './AttachMenu'
import api from '../../services/api.service'

interface MessageInputProps {
  chatId: string
}

export default function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText('')
    try {
      await sendMessage(chatId, trimmed)
    } catch {
      setText(trimmed)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
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
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
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
