import { useState, useEffect } from 'react'
import { X, Hash, Globe, Lock } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useCompanyStore } from '../../stores/companyStore'

interface NewChannelModalProps {
  open: boolean
  onClose: () => void
  onChatCreated: (chatId: string) => void
}

export default function NewChannelModal({ open, onClose, onChatCreated }: NewChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createChannel = useChatStore((s) => s.createChannel)
  const activeCompany = useCompanyStore((s) => s.activeCompany)

  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setIsPublic(false)
      setError('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Channel name is required')
      return
    }
    if (!activeCompany) {
      setError('No workspace selected')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const chat = await createChannel(activeCompany.id, name.trim(), description.trim() || undefined, isPublic)
      onChatCreated(chat.id)
      onClose()
    } catch {
      setError('Failed to create channel')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-orange/10">
              <Hash className="h-4.5 w-4.5 text-holio-orange" />
            </div>
            <h3 className="text-lg font-semibold text-holio-text">New Channel</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-holio-muted" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-holio-muted">
            Channel Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g. general, announcements..."
            maxLength={100}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-holio-muted">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this channel for?"
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-holio-muted">
            Channel Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                !isPublic
                  ? 'border-holio-orange bg-holio-orange/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Lock className={`h-4 w-4 ${!isPublic ? 'text-holio-orange' : 'text-holio-muted'}`} />
              <div>
                <p className={`text-sm font-medium ${!isPublic ? 'text-holio-text' : 'text-holio-muted'}`}>
                  Private
                </p>
                <p className="text-[11px] text-holio-muted">Invite only</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                isPublic
                  ? 'border-holio-orange bg-holio-orange/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`h-4 w-4 ${isPublic ? 'text-holio-orange' : 'text-holio-muted'}`} />
              <div>
                <p className={`text-sm font-medium ${isPublic ? 'text-holio-text' : 'text-holio-muted'}`}>
                  Public
                </p>
                <p className="text-[11px] text-holio-muted">Anyone can join</p>
              </div>
            </button>
          </div>
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-holio-text transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-holio-orange py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </div>
    </div>
  )
}
