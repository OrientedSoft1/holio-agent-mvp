import { ArrowLeft, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const INTEGRATIONS = [
  { name: 'Slack', icon: '💬', color: 'bg-purple-100' },
  { name: 'Google Drive', icon: '📁', color: 'bg-blue-100' },
  { name: 'Notion', icon: '📝', color: 'bg-gray-100' },
]

const CATEGORIES = [
  { name: 'Work', count: 12 },
  { name: 'Family', count: 5 },
  { name: 'Clients', count: 23 },
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

export default function HolioProDashboard() {
  const nav = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 bg-white px-4 shadow-sm">
        <button
          onClick={() => nav(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Star className="h-5 w-5 fill-holio-orange text-holio-orange" />
        <h1 className="text-base font-bold text-holio-text">Holio Pro</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          {/* User Card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-holio-lavender/40 text-lg font-bold text-holio-text">
                  SK
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-holio-orange">
                  <Star className="h-3 w-3 fill-white text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-holio-text">
                  Stein Kvarme
                </h2>
                <button className="mt-0.5 text-sm font-medium text-holio-orange hover:underline">
                  Change Emoji Status
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Progress */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-holio-text">
                Subscription
              </p>
              <span className="text-xs text-holio-muted">Monthly</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[77%] rounded-full bg-holio-orange" />
            </div>
            <p className="mt-2 text-xs text-holio-muted">
              23 days left in current billing cycle
            </p>
          </div>

          {/* Upsell Banner */}
          <button className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm transition-colors hover:bg-holio-orange/5">
            <span className="text-sm font-semibold text-holio-orange">
              15% discount for next month
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-holio-orange" />
          </button>

          {/* Integrations */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-holio-text">
                Holio Integrations
              </h3>
              <button className="text-sm font-medium text-holio-orange hover:underline">
                Manage
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {INTEGRATIONS.map((svc) => (
                <button
                  key={svc.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 px-3 py-4 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/10"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${svc.color}`}
                  >
                    {svc.icon}
                  </span>
                  <span className="text-xs font-medium text-holio-text">
                    {svc.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Categories */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-holio-text">
              Contact Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <span className="text-sm font-medium text-holio-text">
                    {cat.name}
                  </span>
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-holio-lavender/30 px-2 text-xs font-semibold text-holio-text">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Message Tags */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-holio-text">
              Message Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag.label}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-holio-text ${
                    tag.variant === 'lavender'
                      ? 'bg-holio-lavender/40'
                      : 'bg-holio-sage/50'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
