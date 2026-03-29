import { useEffect, useState, useMemo } from 'react'
import { Camera, Image, Plus, X, BookOpen } from 'lucide-react'
import { useStoryStore } from '../stores/storyStore'
import { useAuthStore } from '../stores/authStore'
import StoryCircle from '../components/stories/StoryCircle'
import StoryViewer from '../components/stories/StoryViewer'
import Sidebar from '../components/layout/Sidebar'
import BottomNavBar from '../components/layout/BottomNavBar'
import type { StoryGroup } from '../types'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function StoryPage() {
  const storyGroups = useStoryStore((s) => s.storyGroups)
  const loading = useStoryStore((s) => s.loading)
  const fetchStories = useStoryStore((s) => s.fetchStories)
  const openViewer = useStoryStore((s) => s.openViewer)
  const currentUser = useAuthStore((s) => s.user)

  const [showCreateMenu, setShowCreateMenu] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const myGroup = useMemo(
    () => storyGroups.find((g) => g.user.id === currentUser?.id),
    [storyGroups, currentUser?.id],
  )

  const otherGroups = useMemo(
    () => storyGroups.filter((g) => g.user.id !== currentUser?.id),
    [storyGroups, currentUser?.id],
  )

  const recentGroups = useMemo(
    () => otherGroups.filter((g) => !g.stories.every((s) => s.viewed)),
    [otherGroups],
  )

  const viewedGroups = useMemo(
    () => otherGroups.filter((g) => g.stories.every((s) => s.viewed)),
    [otherGroups],
  )

  const handleOpenGroup = (group: StoryGroup) => {
    const idx = storyGroups.indexOf(group)
    if (idx !== -1) openViewer(idx)
  }

  const handleCreateOption = (_type: 'camera' | 'gallery') => {
    setShowCreateMenu(false)
  }

  const hasNoStories = storyGroups.length === 0 && !loading

  return (
    <div className="flex h-screen bg-holio-offwhite">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-xl font-bold text-holio-dark">Stories</h1>
          <button
            onClick={() => setShowCreateMenu(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-holio-dark transition-colors hover:bg-gray-100"
            aria-label="Create story"
          >
            <Camera className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {loading && storyGroups.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
            </div>
          ) : hasNoStories ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/40">
                <BookOpen className="h-8 w-8 text-holio-dark/60" />
              </div>
              <h2 className="mb-1 text-lg font-semibold text-holio-dark">
                No stories yet
              </h2>
              <p className="mb-6 max-w-xs text-sm text-holio-muted">
                Share photos and videos that disappear after 24 hours with your
                team.
              </p>
              <button
                onClick={() => setShowCreateMenu(true)}
                className="flex items-center gap-2 rounded-full bg-holio-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Create your first story
              </button>
            </div>
          ) : (
            <>
              <section className="mb-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-holio-muted">
                  My Story
                </h2>
                {myGroup ? (
                  <button
                    onClick={() => handleOpenGroup(myGroup)}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white"
                  >
                    <StoryCircle
                      group={myGroup}
                      isOwn
                      onClick={() => handleOpenGroup(myGroup)}
                    />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-holio-dark">
                        My Story
                      </p>
                      <p className="text-xs text-holio-muted">
                        {timeAgo(
                          myGroup.stories[myGroup.stories.length - 1]
                            .createdAt,
                        )}
                      </p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateMenu(true)}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-holio-orange/40 bg-holio-orange/5">
                      <Plus className="h-6 w-6 text-holio-orange" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-holio-dark">
                        Add Story
                      </p>
                      <p className="text-xs text-holio-muted">
                        Share a photo or video
                      </p>
                    </div>
                  </button>
                )}
              </section>

              {recentGroups.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-holio-muted">
                    Recent
                  </h2>
                  <div className="space-y-1">
                    {recentGroups.map((group) => (
                      <StoryRow
                        key={group.user.id}
                        group={group}
                        onClick={() => handleOpenGroup(group)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {viewedGroups.length > 0 && (
                <section>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-holio-muted">
                    Viewed
                  </h2>
                  <div className="space-y-1 opacity-60">
                    {viewedGroups.map((group) => (
                      <StoryRow
                        key={group.user.id}
                        group={group}
                        onClick={() => handleOpenGroup(group)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <BottomNavBar />
      </div>

      {showCreateMenu && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setShowCreateMenu(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-holio-dark">
                Create Story
              </h3>
              <button
                onClick={() => setShowCreateMenu(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleCreateOption('camera')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-holio-offwhite"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange/10">
                  <Camera className="h-5 w-5 text-holio-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-holio-dark">
                    Take Photo
                  </p>
                  <p className="text-xs text-holio-muted">
                    Use your camera to capture a moment
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleCreateOption('gallery')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-holio-offwhite"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender/30">
                  <Image className="h-5 w-5 text-holio-dark/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-holio-dark">
                    Choose from Gallery
                  </p>
                  <p className="text-xs text-holio-muted">
                    Pick an existing photo or video
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <StoryViewer />
    </div>
  )
}

function StoryRow({
  group,
  onClick,
}: {
  group: StoryGroup
  onClick: () => void
}) {
  const latestStory = group.stories[group.stories.length - 1]
  const unviewedCount = group.stories.filter((s) => !s.viewed).length

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white"
    >
      <StoryCircle group={group} onClick={onClick} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-holio-dark">
          {group.user.firstName ?? group.user.username}
        </p>
        <p className="text-xs text-holio-muted">{timeAgo(latestStory.createdAt)}</p>
      </div>
      {unviewedCount > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-holio-orange px-1.5 text-[11px] font-semibold text-white">
          {unviewedCount}
        </span>
      )}
    </button>
  )
}
