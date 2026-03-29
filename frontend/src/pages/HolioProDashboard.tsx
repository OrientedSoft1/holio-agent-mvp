import { useEffect } from 'react'
import { ArrowLeft, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { useIntegrationStore } from '../stores/integrationStore'
import { useTagStore } from '../stores/tagStore'
import { useContactsStore } from '../stores/contactsStore'
import { useCompanyStore } from '../stores/companyStore'

export default function HolioProDashboard() {
  const nav = useNavigate()

  const user = useAuthStore((s) => s.user)
  const subscription = useSubscriptionStore((s) => s.subscription)
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription)
  const integrations = useIntegrationStore((s) => s.integrations)
  const fetchIntegrations = useIntegrationStore((s) => s.fetchIntegrations)
  const tags = useTagStore((s) => s.tags)
  const fetchTags = useTagStore((s) => s.fetchTags)
  const contacts = useContactsStore((s) => s.contacts)
  const fetchContacts = useContactsStore((s) => s.fetchContacts)
  const activeCompany = useCompanyStore((s) => s.activeCompany)

  useEffect(() => {
    fetchSubscription()
    fetchTags()
    fetchContacts()
  }, [fetchSubscription, fetchTags, fetchContacts])

  useEffect(() => {
    if (activeCompany?.id) {
      fetchIntegrations(activeCompany.id)
    }
  }, [activeCompany?.id, fetchIntegrations])

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?'
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : 'Unknown'

  const progressPercent = subscription
    ? Math.round((subscription.daysLeft / subscription.totalDays) * 100)
    : 0

  const displayedIntegrations = integrations
    .filter((i) => i.connected)
    .slice(0, 3)

  return (
    <div className="flex min-h-full flex-col bg-holio-offwhite">
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
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-holio-orange shadow-sm">
                <Star className="h-3 w-3 fill-white text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-bold text-holio-text">
                  {displayName}
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
          {subscription ? (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-holio-text">
                  {subscription.daysLeft} days left
                </p>
                <span className="text-xs font-medium text-holio-muted">
                  {subscription.interval === 'annual' ? 'Annual' : 'Monthly'} plan
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-holio-orange transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-holio-muted">No active subscription</p>
              <button
                onClick={() => nav('/holio-pro')}
                className="text-sm font-medium text-holio-orange transition-colors hover:text-holio-orange/80"
              >
                Subscribe
              </button>
            </div>
          )}
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
          {displayedIntegrations.length > 0 ? (
            <div className="space-y-2">
              {displayedIntegrations.map((svc) => (
                <div
                  key={svc.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-holio-lavender/20 text-xl">
                    {svc.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-holio-text">
                      {svc.name}
                    </p>
                    <p className="text-xs text-holio-muted">
                      {svc.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-holio-muted" />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-3 text-center text-sm text-holio-muted">
              No integrations connected yet
            </p>
          )}
        </div>

        {/* Contact Categories */}
        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Contact Categories
        </p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/5">
              <span className="text-sm font-semibold text-holio-text">
                All Contacts
              </span>
              <span className="mt-0.5 text-xs text-holio-muted">
                {contacts.length} Contacts
              </span>
            </div>
            <div className="flex flex-col rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-holio-lavender hover:bg-holio-lavender/5">
              <span className="text-sm font-semibold text-holio-text">
                Favorites
              </span>
              <span className="mt-0.5 text-xs text-holio-muted">
                {contacts.filter((c) => c.isFavorite).length} Contacts
              </span>
            </div>
          </div>
        </div>

        {/* Message Tags */}
        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Message Tags
        </p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-holio-lavender/20 px-3 py-1.5 text-sm font-medium text-holio-text"
                >
                  {tag.emoji} {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="py-3 text-center text-sm text-holio-muted">
              No tags created yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
