import { useState } from 'react'
import { Paperclip, Smile, Mic, Send } from 'lucide-react'

export default function MessageInput() {
  const [text, setText] = useState('')

  return (
    <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
      <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
        <Paperclip className="h-5 w-5" />
      </button>

      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          className="w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:ring-2 focus:ring-holio-lavender/50"
        />
      </div>

      <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text">
        <Smile className="h-5 w-5" />
      </button>

      {text.trim() ? (
        <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90">
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
