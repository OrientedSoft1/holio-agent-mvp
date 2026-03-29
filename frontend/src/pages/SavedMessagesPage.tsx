import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bookmark, Trash2, FileText, Image as ImageIcon } from 'lucide-react'
import api from '../services/api.service'
import { cn } from '../lib/utils'

interface SavedMessage {
  id: string
  content: string
  type: 'text' | 'image' | 'file'
  chatName: string
  fileName?: string
  imageUrl?: string
  createdAt: string
}

export default function SavedMessagesPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.get<SavedMessage[]>('/saved-messages')
      .then(({ data }) => setMessages(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const unsave = async (id: string) => {
    setDeletingIds((s) => new Set(s).add(id))
    try {
      await api.delete(`/saved-messages/${id}`)
      setMessages((m) => m.filter((msg) => msg.id !== id))
    } catch { /* silent */ }
    setDeletingIds((s) => { const n = new Set(s); n.delete(id); return n })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Saved Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF9220] border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-red-500">Failed to load saved messages</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm font-medium text-[#FF9220]">Retry</button>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <Bookmark className="mb-3 h-14 w-14 text-[#8E8E93]/25" />
            <p className="text-base font-medium text-[#1A1A1A]">No saved messages</p>
            <p className="mt-1 text-sm text-[#8E8E93]">Messages you save will appear here</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="space-y-3 px-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('rounded-2xl bg-white p-4 shadow-sm', deletingIds.has(msg.id) && 'opacity-50')}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#FF9220]">{msg.chatName}</span>
                  <span className="text-xs text-[#8E8E93]">{formatDate(msg.createdAt)}</span>
                </div>
                {msg.type === 'text' && (
                  <p className="line-clamp-2 text-sm text-[#1A1A1A]">{msg.content}</p>
                )}
                {msg.type === 'image' && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#8E8E93]" />
                    <span className="text-sm text-[#1A1A1A]">Photo</span>
                  </div>
                )}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#8E8E93]" />
                    <span className="text-sm text-[#1A1A1A]">{msg.fileName || 'File'}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <button onClick={() => unsave(msg.id)} disabled={deletingIds.has(msg.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" /> Unsave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
