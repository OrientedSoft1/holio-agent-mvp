import { useEffect, useState, useCallback } from 'react'
import { X, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStoryStore } from '../../stores/storyStore'
import { useAuthStore } from '../../stores/authStore'
import type { StoryGroup } from '../../types'

const STORY_DURATION = 5000

export default function StoryViewer() {
  const viewerOpen = useStoryStore((s) => s.viewerOpen)
  const storyGroups = useStoryStore((s) => s.storyGroups)
  const activeGroupIndex = useStoryStore((s) => s.activeGroupIndex)
  const activeStoryIndex = useStoryStore((s) => s.activeStoryIndex)
  const closeViewer = useStoryStore((s) => s.closeViewer)
  const nextStory = useStoryStore((s) => s.nextStory)
  const prevStory = useStoryStore((s) => s.prevStory)
  const viewStory = useStoryStore((s) => s.viewStory)
  const currentUser = useAuthStore((s) => s.user)

  const [progress, setProgress] = useState(0)
  const [reply, setReply] = useState('')

  const currentGroup = storyGroups[activeGroupIndex] as StoryGroup | undefined
  const currentStory = currentGroup?.stories[activeStoryIndex]
  const isOwn = currentUser?.id === currentGroup?.user.id

  const handleNext = useCallback(() => {
    nextStory()
  }, [nextStory])

  useEffect(() => {
    if (!viewerOpen || !currentStory) return
    viewStory(currentStory.id)
  }, [viewerOpen, currentStory?.id, viewStory])

  useEffect(() => {
    if (!viewerOpen || !currentStory) return
    if (currentStory.mediaType === 'video') return

    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          handleNext()
          return 0
        }
        return p + 100 / (STORY_DURATION / 50)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [viewerOpen, currentStory?.id, handleNext])

  if (!viewerOpen || !currentGroup || !currentStory) return null

  const storyCount = currentGroup.stories.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <button
        onClick={closeViewer}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={prevStory}
        className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="relative flex h-full max-h-[90vh] w-full max-w-lg flex-col">
        {/* Progress bars */}
        <div className="absolute top-2 right-3 left-3 z-10 flex gap-1">
          {Array.from({ length: storyCount }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-75"
                style={{
                  width:
                    i < activeStoryIndex
                      ? '100%'
                      : i === activeStoryIndex
                        ? `${progress}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 right-3 left-3 z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20">
            {currentGroup.user.avatarUrl ? (
              <img
                src={currentGroup.user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-white">
                {(currentGroup.user.firstName ?? '?')[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {currentGroup.user.firstName ?? currentGroup.user.username}
            </p>
            <p className="text-[11px] text-white/60">
              {new Date(currentStory.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {isOwn && (
            <div className="flex items-center gap-1 text-white/70">
              <Eye className="h-4 w-4" />
              <span className="text-xs">
                {currentGroup.stories.filter((s) => s.viewed).length}
              </span>
            </div>
          )}
        </div>

        {/* Story content */}
        <div
          className="flex flex-1 items-center justify-center"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            if (x < rect.width / 2) {
              prevStory()
            } else {
              handleNext()
            }
          }}
        >
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              className="max-h-full max-w-full object-contain"
              autoPlay
              onEnded={handleNext}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-0 right-0 px-4 text-center">
            <p className="inline-block rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Bottom bar */}
        {!isOwn && (
          <div className="absolute bottom-4 right-3 left-3 flex items-center gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to story..."
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/40"
            />
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
