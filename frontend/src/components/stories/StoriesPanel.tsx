import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CircleDot } from 'lucide-react'
import StoryCircle from './StoryCircle'
import StoryViewer from './StoryViewer'
import { useStoryStore } from '../../stores/storyStore'
import { useAuthStore } from '../../stores/authStore'

export default function StoriesPanel() {
  const storyGroups = useStoryStore((s) => s.storyGroups)
  const loading = useStoryStore((s) => s.loading)
  const fetchStories = useStoryStore((s) => s.fetchStories)
  const openViewer = useStoryStore((s) => s.openViewer)
  const currentUser = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const recentGroups = useMemo(
    () => storyGroups.filter((g) => !g.stories.every((s) => s.viewed)),
    [storyGroups],
  )

  const viewedGroups = useMemo(
    () => storyGroups.filter((g) => g.stories.every((s) => s.viewed)),
    [storyGroups],
  )

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-shrink-0 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-holio-text">Stories</h2>
          <CircleDot className="h-5 w-5 text-holio-orange" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My Story */}
        <div className="px-4 pt-4 pb-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
            My Story
          </p>
          <button onClick={() => navigate('/story')} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-dashed border-holio-muted/40">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-holio-muted">
                  {(currentUser?.firstName ?? '?')[0]}
                </span>
              )}
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
        </div>

        {loading && storyGroups.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {/* Recent (unviewed) */}
        {recentGroups.length > 0 && (
          <div className="mt-2">
            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
              Recent
            </p>
            <div className="flex flex-wrap gap-3 px-4 pb-2">
              {recentGroups.map((group) => {
                const globalIdx = storyGroups.indexOf(group)
                return (
                  <StoryCircle
                    key={group.user.id}
                    group={group}
                    isOwn={group.user.id === currentUser?.id}
                    onClick={() => openViewer(globalIdx)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Viewed */}
        {viewedGroups.length > 0 && (
          <div className="mt-2">
            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
              Viewed
            </p>
            <div className="flex flex-wrap gap-3 px-4 pb-2">
              {viewedGroups.map((group) => {
                const globalIdx = storyGroups.indexOf(group)
                return (
                  <StoryCircle
                    key={group.user.id}
                    group={group}
                    isOwn={group.user.id === currentUser?.id}
                    onClick={() => openViewer(globalIdx)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {!loading && storyGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <CircleDot className="h-8 w-8 text-holio-lavender" />
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">
              No stories yet
            </p>
            <p className="mt-1 text-xs text-holio-muted">
              Stories from your contacts will appear here
            </p>
          </div>
        )}
      </div>

      <StoryViewer />
    </div>
  )
}
