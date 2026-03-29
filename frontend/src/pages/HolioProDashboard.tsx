import { ArrowLeft, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const INTEGRATIONS = [
  { name: 'Slack', icon: '💬', color: 'bg-purple-100', lastActive: '2 hours ago' },
  { name: 'Google Drive', icon: '📁', color: 'bg-blue-100', lastActive: 'Yesterday' },
  { name: 'Notion', icon: '📝', color: 'bg-gray-100', lastActive: '3 days ago' },
]

const CATEGORIES = [
  { name: 'Work', count: 12 },
  { name: 'Family', count: 5 },
  { name: 'Developers', count: 23 },
  { name: 'VIP', count: 8 },
]

const TAGS = [
  { emoji: '🔥', label: 'Urgent', variant: 'lavender' as const },
  { emoji: '📌', label: 'Pinned', variant: 'sage' as const },
  { emoji: '✅', label: 'Done', variant: 'sage' as const },
  { emoji: '⏳', label: 'Pending', variant: 'lavender' as const },
  { emoji: '💡', label: 'Idea', variant: 'lavender' as const },
  { emoji: '🐛', label: 'Bug', variant: 'sage' as const },
]

const SUBSCRIPTION_DAYS_LEFT = 23
const SUBSCRIPTION_TOTAL_DAYS = 30

export default function HolioProDashboard() {
  const nav = useNavigate()
  const progressPercent = Math.round(
    (SUBSCRIPTION_DAYS_LEFT / SUBSCRIPTION_TOTAL_DAYS) * 100,
  )

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4">
        <button
          onClick={() => nav('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Star className="h-5 w-5 fill-holio-orange text-holio-orange" />
        <h1 className="text-base font-bold text-holio-text">Holio Pro</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* User Row */}
        <div className="mx-4 mt-4 rounded-2xl bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-holio-lavender/40 text-lg font-bold text-holio-text">
                SK
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-holio-orange shadow-sm">
                <Star className="h-3 w-3 fill-white text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-bold text-holio-text">
                  Stein Kvarme
                </h2>
                <span className="text-sm">⭐</span>
              </div>
              <button className="mt-0.5 text-sm font-medium text-holio-orange transition-colors hover:text-holio-orange/80">
                Change Emoji Status
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Progress */}
        <div className="mx-4 mt-3 rounded-2xl bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-holio-text">
              {SUBSCRIPTION_DAYS_LEFT} days left
            </p>
            <span className="text-xs font-medium text-holio-muted">
              Monthly plan
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-holio-orange transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Upsell Discount Banner */}
        <button
          className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-between rounded-2xl bg-white p-4 transition-colors hover:bg-holio-orange/5"
        >
          <span className="text-sm font-semibold text-holio-orange">
            15% discount for your next month
          </span>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-holio-orange" />
        </button>

        {/* Holio Integrations */}
        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Holio Integrations
        </p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-holio-text">
              Connected Services
            </h3>
            <button
              onClick={() => nav('/integrations')}
              className="text-sm font-medium text-holio-orange transition-colors hover:text-holio-orange/80"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2">
            {INTEGRATIONS.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/5"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${svc.color}`}
                >
                  {svc.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-holio-text">
                    {svc.name}
                  </p>
                  <p className="text-xs text-holio-muted">
                    Last activity: {svc.lastActive}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-holio-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Categories */}
        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Contact Categories
        </p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/5"
              >
                <span className="text-sm font-semibold text-holio-text">
                  {cat.name}
                </span>
                <span className="mt-0.5 text-xs text-holio-muted">
                  {cat.count} Contacts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message Tags */}
        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Message Tags
        </p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-holio-text ${
                  tag.variant === 'lavender'
                    ? 'bg-holio-lavender/20'
                    : 'bg-holio-sage/30'
                }`}
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
