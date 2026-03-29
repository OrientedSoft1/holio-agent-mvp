import { useState, useEffect, useCallback } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTagStore } from '../../stores/tagStore'

interface TagSelectionPopupProps {
  open: boolean
  onClose: () => void
  onSave: (tagIds: string[]) => void
  selectedTagIds?: string[]
}

export default function TagSelectionPopup({
  open,
  onClose,
  onSave,
  selectedTagIds = [],
}: TagSelectionPopupProps) {
  const tags = useTagStore((s) => s.tags)
  const loading = useTagStore((s) => s.loading)
  const fetchTags = useTagStore((s) => s.fetchTags)

  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedTagIds),
  )
  const [prevOpen, setPrevOpen] = useState(open)

  useEffect(() => {
    if (open && tags.length === 0) {
      fetchTags()
    }
  }, [open, tags.length, fetchTags])

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSelected(new Set(selectedTagIds))
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  const toggleTag = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    onSave(Array.from(selected))
    handleClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-label="Select tags"
    >
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-200',
          visible ? 'bg-black/30' : 'bg-transparent',
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-t-2xl bg-white p-4 shadow-xl transition-transform duration-200 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-holio-text">
            Add to Tags
          </h3>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && tags.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        ) : tags.length === 0 ? (
          <div className="py-8 text-center text-sm text-holio-muted">
            No tags yet. Create your first tag to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag, index) => {
              const isSelected = selected.has(tag.id)
              const pillBg = index % 2 === 0 ? 'bg-holio-lavender/30' : 'bg-holio-sage/30'

              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    pillBg,
                    isSelected && 'ring-1 ring-holio-orange/40',
                  )}
                >
                  <span className="text-xl">{tag.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-holio-text">
                    {tag.name}
                  </span>
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                      isSelected
                        ? 'border-holio-orange bg-holio-orange'
                        : 'border-gray-300',
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          className="mt-4 w-full rounded-xl bg-holio-orange py-2.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 active:bg-holio-orange/80"
        >
          Done
        </button>
      </div>
    </div>
  )
}
