import { useEffect } from 'react'
import { useTagStore } from '../../stores/tagStore'
import { cn } from '../../lib/utils'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  compact?: boolean
}

export default function TagSelector({ selectedTagIds, onChange, compact }: TagSelectorProps) {
  const tags = useTagStore((s) => s.tags)
  const fetchTags = useTagStore((s) => s.fetchTags)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  if (tags.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'gap-1')}>
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              isSelected
                ? 'bg-holio-orange/20 text-holio-orange ring-1 ring-holio-orange/30'
                : 'bg-gray-100 text-holio-muted hover:bg-gray-200',
              compact && 'px-2 py-0.5 text-[11px]',
            )}
          >
            <span>{tag.emoji}</span>
            <span>{tag.name}</span>
          </button>
        )
      })}
    </div>
  )
}
