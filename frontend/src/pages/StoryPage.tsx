import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  Plus,
  X,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import type { Story, StoryGroup, User } from '../types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CURRENT_USER: User = {
  id: 'me',
  phone: '+1234567890',
  username: 'me',
  firstName: 'You',
  lastName: null,
  bio: null,
  avatarUrl: null,
  lastSeen: null,
}

function makeStory(
  id: string,
  userId: string,
  caption: string | null,
  viewed: boolean,
  minutesAgo: number,
): Story {
  const now = Date.now()
  return {
    id,
    userId,
    companyId: null,
    mediaUrl: '',
    mediaType: 'image',
    caption,
    privacyLevel: 'everyone',
    expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - minutesAgo * 60 * 1000).toISOString(),
    user: CURRENT_USER,
    viewed,
  }
}

const MOCK_STORIES: StoryGroup[] = [
  {
    user: {
      id: 'u1',
      phone: '+111',
      username: 'anna',
      firstName: 'Anna',
      lastName: 'Berg',
      bio: null,
      avatarUrl: null,
      lastSeen: null,
    },
    stories: [
      {
        ...makeStory('s1', 'u1', 'Morning coffee ☕', false, 120),
        user: { id: 'u1', phone: '+111', username: 'anna', firstName: 'Anna', lastName: 'Berg', bio: null, avatarUrl: null, lastSeen: null },
      },
      {
        ...makeStory('s2', 'u1', 'Office vibes today 🏢', false, 45),
        user: { id: 'u1', phone: '+111', username: 'anna', firstName: 'Anna', lastName: 'Berg', bio: null, avatarUrl: null, lastSeen: null },
      },
    ],
  },
  {
    user: {
      id: 'u2',
      phone: '+222',
      username: 'erik',
      firstName: 'Erik',
      lastName: 'Solberg',
      bio: null,
      avatarUrl: null,
      lastSeen: null,
    },
    stories: [
      {
        ...makeStory('s3', 'u2', 'New product launch! 🚀', false, 300),
        user: { id: 'u2', phone: '+222', username: 'erik', firstName: 'Erik', lastName: 'Solberg', bio: null, avatarUrl: null, lastSeen: null },
      },
    ],
  },
  {
    user: {
      id: 'u3',
      phone: '+333',
      username: 'maria',
      firstName: 'Maria',
      lastName: 'Lindgren',
      bio: null,
      avatarUrl: null,
      lastSeen: null,
    },
    stories: [
      {
        ...makeStory('s4', 'u3', 'Team dinner 🍕', true, 600),
        user: { id: 'u3', phone: '+333', username: 'maria', firstName: 'Maria', lastName: 'Lindgren', bio: null, avatarUrl: null, lastSeen: null },
      },
      {
        ...makeStory('s5', 'u3', 'Working late again 🌙', true, 400),
        user: { id: 'u3', phone: '+333', username: 'maria', firstName: 'Maria', lastName: 'Lindgren', bio: null, avatarUrl: null, lastSeen: null },
      },
      {
        ...makeStory('s6', 'u3', 'Finally home 🏡', true, 180),
        user: { id: 'u3', phone: '+333', username: 'maria', firstName: 'Maria', lastName: 'Lindgren', bio: null, avatarUrl: null, lastSeen: null },
      },
    ],
  },
  {
    user: {
      id: 'u4',
      phone: '+444',
      username: 'olav',
      firstName: 'Olav',
      lastName: 'Hansen',
      bio: null,
      avatarUrl: null,
      lastSeen: null,
    },
    stories: [
      {
        ...makeStory('s7', 'u4', 'Hiking in the mountains 🏔️', true, 900),
        user: { id: 'u4', phone: '+444', username: 'olav', firstName: 'Olav', lastName: 'Hansen', bio: null, avatarUrl: null, lastSeen: null },
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function avatarInitial(user: User): string {
  return (user.firstName ?? user.username ?? '?')[0].toUpperCase()
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ user, size = 48 }: { user: User; size?: number }) {
  const px = `${size}px`
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.firstName}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-holio-lavender font-semibold text-holio-dark"
      style={{ width: px, height: px, fontSize: `${size * 0.38}px` }}
    >
      {avatarInitial(user)}
    </div>
  )
}

function StoryRow({
  group,
  viewed,
  onClick,
}: {
  group: StoryGroup
  viewed: boolean
  onClick: () => void
}) {
  const latestStory = group.stories[group.stories.length - 1]
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <div
        className={cn(
          'flex-shrink-0 rounded-full p-[3px]',
          viewed
            ? 'bg-gray-300'
            : 'bg-gradient-to-br from-holio-orange via-orange-400 to-amber-500',
        )}
      >
        <div className="rounded-full bg-white p-[2px]">
          <Avatar user={group.user} size={48} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-holio-text">
          {group.user.firstName} {group.user.lastName ?? ''}
        </p>
        <p className="text-xs text-holio-muted">
          {formatTimeAgo(latestStory.createdAt)}
        </p>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Story Viewer
// ---------------------------------------------------------------------------

function StoryViewer({
  groups,
  initialGroupIndex,
  onClose,
}: {
  groups: StoryGroup[]
  initialGroupIndex: number
  onClose: () => void
}) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex)
  const [storyIdx, setStoryIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const DURATION = 5000

  const group = groups[groupIdx]
  const story = group?.stories[storyIdx]

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const goNext = useCallback(() => {
    clearTimer()
    if (!group) return

    if (storyIdx < group.stories.length - 1) {
      setStoryIdx((i) => i + 1)
      setProgress(0)
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((g) => g + 1)
      setStoryIdx(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [clearTimer, group, storyIdx, groupIdx, groups.length, onClose])

  const goPrev = useCallback(() => {
    clearTimer()
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1)
      setProgress(0)
    } else if (groupIdx > 0) {
      setGroupIdx((g) => g - 1)
      const prevGroup = groups[groupIdx - 1]
      setStoryIdx(prevGroup.stories.length - 1)
      setProgress(0)
    }
  }, [clearTimer, storyIdx, groupIdx, groups])

  const goNextRef = useRef(goNext)
  useEffect(() => {
    goNextRef.current = goNext
  }, [goNext])

  useEffect(() => {
    clearTimer()
    let current = 0
    const step = 50
    const increment = step / DURATION

    timerRef.current = setInterval(() => {
      current += increment
      if (current >= 1) {
        clearTimer()
        goNextRef.current()
        return
      }
      setProgress(current)
    }, step)

    // Reset progress on first paint via a microtask (not synchronous in effect body)
    queueMicrotask(() => setProgress(0))

    return clearTimer
  }, [groupIdx, storyIdx, clearTimer])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onClose])

  if (!group || !story) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-holio-dark">
      <div className="relative flex h-full w-full max-w-lg flex-col">
        {/* Progress bars */}
        <div className="absolute top-0 right-0 left-0 z-10 flex gap-1 px-3 pt-3">
          {group.stories.map((s, i) => (
            <div
              key={s.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
                style={{
                  width:
                    i < storyIdx
                      ? '100%'
                      : i === storyIdx
                        ? `${progress * 100}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center gap-3 px-4 pt-6">
          <Avatar user={group.user} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {group.user.firstName} {group.user.lastName ?? ''}
            </p>
            <p className="text-[11px] text-white/60">
              {formatTimeAgo(story.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Story content */}
        <div className="flex flex-1 items-center justify-center px-6">
          {story.mediaUrl ? (
            <img
              src={story.mediaUrl}
              alt={story.caption ?? 'Story'}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <p className="text-center text-2xl font-semibold leading-relaxed text-white">
              {story.caption}
            </p>
          )}
        </div>

        {/* Caption overlay (when there's both media and caption) */}
        {story.mediaUrl && story.caption && (
          <div className="absolute bottom-8 right-0 left-0 px-6 text-center">
            <p className="text-sm font-medium text-white drop-shadow-lg">
              {story.caption}
            </p>
          </div>
        )}

        {/* Tap zones for navigation */}
        <button
          aria-label="Previous story"
          className="absolute top-0 left-0 h-full w-1/3 cursor-default focus:outline-none"
          onClick={goPrev}
        />
        <button
          aria-label="Next story"
          className="absolute top-0 right-0 h-full w-1/3 cursor-default focus:outline-none"
          onClick={goNext}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create Story Bottom Sheet
// ---------------------------------------------------------------------------

function CreateStorySheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 bottom-0 left-0 z-50 animate-slide-up rounded-t-2xl bg-white px-4 pb-8 pt-5 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        <h3 className="mb-4 text-base font-semibold text-holio-text">
          Create Story
        </h3>

        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
          onClick={onClose}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange/10">
            <Camera className="h-5 w-5 text-holio-orange" />
          </div>
          <span className="text-sm font-medium text-holio-text">
            Take Photo
          </span>
        </button>

        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender/40">
            <ImageIcon className="h-5 w-5 text-holio-dark" />
          </div>
          <span className="text-sm font-medium text-holio-text">
            Choose from Gallery
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onClose}
        />

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-holio-muted transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function StoryPage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.user)
  const [viewerGroupIdx, setViewerGroupIdx] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [myStoryGroup] = useState<StoryGroup | null>(null)

  const recentGroups = MOCK_STORIES.filter(
    (g) => !g.stories.every((s) => s.viewed),
  )
  const viewedGroups = MOCK_STORIES.filter((g) =>
    g.stories.every((s) => s.viewed),
  )

  const allViewable = [...recentGroups, ...viewedGroups]

  function openViewer(group: StoryGroup) {
    const idx = allViewable.findIndex((g) => g.user.id === group.user.id)
    if (idx >= 0) setViewerGroupIdx(idx)
  }

  const currentUser: User = authUser ?? CURRENT_USER

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Stories</h1>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {/* My Story section */}
        <div className="px-4 pt-4 pb-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-holio-muted">
            My Story
          </p>
          {myStoryGroup ? (
            <button
              onClick={() => openViewer(myStoryGroup)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="rounded-full bg-gradient-to-br from-holio-orange via-orange-400 to-amber-500 p-[3px]">
                <div className="rounded-full bg-white p-[2px]">
                  <Avatar user={currentUser} size={48} />
                </div>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-holio-text">
                  My Story
                </p>
                <p className="flex items-center gap-1 text-xs text-holio-muted">
                  <Eye className="h-3 w-3" />
                  {myStoryGroup.stories.length} update
                  {myStoryGroup.stories.length !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-dashed border-holio-muted/40">
                <Avatar user={currentUser} size={44} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-holio-text">
                  Add to My Story
                </p>
                <p className="text-xs text-holio-muted">
                  Share a photo or update
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-holio-orange">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Recent (unviewed) */}
        {recentGroups.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 px-4 text-xs font-semibold uppercase tracking-wide text-holio-muted">
              Recent
            </p>
            {recentGroups.map((group) => (
              <StoryRow
                key={group.user.id}
                group={group}
                viewed={false}
                onClick={() => openViewer(group)}
              />
            ))}
          </div>
        )}

        {/* Viewed */}
        {viewedGroups.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 px-4 text-xs font-semibold uppercase tracking-wide text-holio-muted">
              Viewed
            </p>
            {viewedGroups.map((group) => (
              <StoryRow
                key={group.user.id}
                group={group}
                viewed
                onClick={() => openViewer(group)}
              />
            ))}
          </div>
        )}

        {recentGroups.length === 0 && viewedGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 pt-20 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/30">
              <Camera className="h-7 w-7 text-holio-muted/50" />
            </div>
            <p className="text-sm font-medium text-holio-text">
              No stories yet
            </p>
            <p className="mt-1 text-xs text-holio-muted">
              Stories from your contacts will appear here
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed right-5 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-holio-orange shadow-lg shadow-holio-orange/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Create Story Bottom Sheet */}
      <CreateStorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* Full-screen Story Viewer */}
      {viewerGroupIdx !== null && allViewable.length > 0 && (
        <StoryViewer
          groups={allViewable}
          initialGroupIndex={viewerGroupIdx}
          onClose={() => setViewerGroupIdx(null)}
        />
      )}
    </div>
  )
}
