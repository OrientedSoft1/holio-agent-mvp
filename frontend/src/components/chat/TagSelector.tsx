import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Check, Plus, Hash } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTagStore } from '../../stores/tagStore'

interface TagSelectorProps {
  messageId: string
  onClose: () => void
}

const EMOJI_OPTIONS = ['🎨', '🔗', '📐', '⭐', '📖', '💡', '🚀', '🔥', '📌', '🎯', '💬', '📊']

export default function TagSelector({ messageId, onClose }: TagSelectorProps) {
  const tags = useTagStore((s) => s.tags)
  const messageTagMap = useTagStore((s) => s.messageTagMap)
  const toggleMessageTag = useTagStore((s) => s.toggleMessageTag)
  const createTag = useTagStore((s) => s.createTag)
  const fetchTags = useTagStore((s) => s.fetchTags)

  const [visible, setVisible] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('💡')
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTagIds = messageTagMap[messageId] ?? []

  useEffect(() => {
    fetchTags()
    requestAnimationFrame(() => setVisible(true))
  }, [fetchTags])

  useEffect(() => {
    if (showCreate && inputRef.current) inputRef.current.focus()
  }, [showCreate])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleClose])

  const handleToggle = (tagId: string) => {
    toggleMessageTag(messageId, tagId)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createTag(newName.trim(), newEmoji)
    setNewName('')
    setNewEmoji('💡')
    setShowCreate(false)
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn('absolute inset-0 transition-opacity duration-200', visible ? 'bg-black/30' : 'bg-transparent')}
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pb-8 pt-3 shadow-xl transition-transform duration-200 ease-out dark:bg-[#1E3035]',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mb-3 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-holio-orange" />
            <h3 className="text-base font-semibold text-holio-text dark:text-white">Add to Tags</h3>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {tags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id)
            const bgColor = tag.color === 'lavender' ? 'bg-holio-lavender/20' : 'bg-holio-sage/20'
            const activeBg = tag.color === 'lavender' ? 'bg-holio-lavender/40' : 'bg-holio-sage/40'

            return (
              <button
                key={tag.id}
                onClick={() => handleToggle(tag.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
                  isActive ? activeBg : `${bgColor} hover:opacity-80`,
                )}
              >
                <span className="text-lg">{tag.emoji}</span>
                <span className="flex-1 text-left text-sm font-medium text-holio-text dark:text-white">
                  {tag.name}
                </span>
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all',
                    isActive
                      ? 'border-holio-orange bg-holio-orange'
                      : 'border-gray-300 dark:border-gray-500',
                  )}
                >
                  {isActive && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            )
          })}
        </div>

        {showCreate ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewEmoji(emoji)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all',
                      newEmoji === emoji ? 'bg-holio-orange/20 ring-2 ring-holio-orange' : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                placeholder="Tag name..."
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-orange dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-holio-muted transition-colors hover:border-holio-orange hover:text-holio-orange dark:border-gray-600"
          >
            <Plus className="h-4 w-4" />
            Create New Tag
          </button>
        )}
      </div>
    </div>
  )
}
