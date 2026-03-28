import { useState, useRef, type KeyboardEvent } from 'react'
import { Paperclip, Smile, Mic, Send } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

interface MessageInputProps {
  chatId: string
}

export default function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 bg-white p-3">
      <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
        <Paperclip className="h-5 w-5" />
      </button>

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

      <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
        <Smile className="h-5 w-5" />
      </button>

      {text.trim() ? (
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      ) : (
        <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
          <Mic className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
