import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { FEATURES, FALLBACK_PLANS } from '../config/plans'

type PlanInterval = 'annual' | 'monthly'

function SparkleGraphic() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <div className="absolute inset-0 animate-pulse rounded-full bg-white/20 blur-2xl" />
      <span className="relative text-7xl drop-shadow-lg" role="img" aria-label="sparkle">
        ✨
      </span>
    </div>
  )
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function usePlans() {
  const storePlans = useSubscriptionStore((s) => s.plans)

  if (storePlans.length > 0) {
    const annual = storePlans.find((p) => p.interval === 'annual')
    const monthly = storePlans.find((p) => p.interval === 'monthly')
    return {
      annual: {
        id: annual?.id ?? '',
        pricePerMonth: annual ? formatPrice(annual.pricePerMonth, annual.currency) : FALLBACK_PLANS.annual.pricePerMonth,
        totalPerYear: annual?.totalPerYear ? formatPrice(annual.totalPerYear, annual.currency) : FALLBACK_PLANS.annual.totalPerYear,
        label: 'Annual',
        discount: annual?.discount ?? FALLBACK_PLANS.annual.discount,
      },
      monthly: {
        id: monthly?.id ?? '',
        pricePerMonth: monthly ? formatPrice(monthly.pricePerMonth, monthly.currency) : FALLBACK_PLANS.monthly.pricePerMonth,
        totalPerYear: null as string | null,
        label: 'Monthly',
        discount: monthly?.discount ?? null,
      },
    }
  }

  return {
    annual: { ...FALLBACK_PLANS.annual, id: '' },
    monthly: { ...FALLBACK_PLANS.monthly, id: '' },
  }
}

export default function HolioProPage() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<PlanInterval>('annual')
  const fetchPlans = useSubscriptionStore((s) => s.fetchPlans)
  const subscribe = useSubscriptionStore((s) => s.subscribe)
  const subscribing = useSubscriptionStore((s) => s.subscribing)
  const plans = usePlans()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const plan = plans[selectedPlan]
  const ctaText =
    selectedPlan === 'annual'
      ? `Subscribe for ${plan.totalPerYear} / year`
      : `Subscribe for ${plan.pricePerMonth} / month`

  const handleSubscribe = async () => {
    const planId = plans[selectedPlan].id
    if (!planId) return
    const result = await subscribe(planId)
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="relative flex h-14 items-center gap-3 bg-white px-4 shadow-sm">
        <button
          onClick={() => navigate('/settings')}
          aria-label="Back to settings"
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-holio-text">Holio Pro</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="flex flex-col items-center bg-gradient-to-br from-holio-lavender to-holio-orange px-6 pb-10 pt-8">
          <SparkleGraphic />
          <h2 className="mt-4 text-2xl font-black text-white">Holio Pro</h2>
          <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-white/90">
            Go beyond the limits, get exclusive features and support us by subscribing to Holio Pro.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md px-4 py-6">
          {/* Pricing cards */}
          <div className="flex gap-3">
            {/* Annual card */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={cn(
                'relative flex flex-1 flex-col items-center rounded-2xl border-2 px-3 py-4 transition-all',
                selectedPlan === 'annual'
                  ? 'border-holio-orange bg-white shadow-md'
                  : 'border-gray-200 bg-white',
              )}
            >
              {plans.annual.discount && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-holio-orange px-2 py-0.5 text-[10px] font-bold text-white">
                  {plans.annual.discount}
                </span>
              )}
              <div
                className={cn(
                  'mb-2 flex h-5 w-5 items-center justify-center rounded-full border-2',
                  selectedPlan === 'annual' ? 'border-holio-orange' : 'border-gray-300',
                )}
              >
                {selectedPlan === 'annual' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-holio-orange" />
                )}
              </div>
              <span className="text-xs font-semibold text-holio-muted">Annual</span>
              <span className="mt-1 text-lg font-black text-holio-text">
                {plans.annual.pricePerMonth}
              </span>
              <span className="text-[11px] text-holio-muted">per month</span>
            </button>

            {/* Monthly card */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'relative flex flex-1 flex-col items-center rounded-2xl border-2 px-3 py-4 transition-all',
                selectedPlan === 'monthly'
                  ? 'border-holio-orange bg-white shadow-md'
                  : 'border-gray-200 bg-white',
              )}
            >
              <div
                className={cn(
                  'mb-2 flex h-5 w-5 items-center justify-center rounded-full border-2',
                  selectedPlan === 'monthly' ? 'border-holio-orange' : 'border-gray-300',
                )}
              >
                {selectedPlan === 'monthly' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-holio-orange" />
                )}
              </div>
              <span className="text-xs font-semibold text-holio-muted">Monthly</span>
              <span className="mt-1 text-lg font-black text-holio-text">
                {plans.monthly.pricePerMonth}
              </span>
              <span className="text-[11px] text-holio-muted">per month</span>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="mt-5 w-full rounded-xl bg-holio-orange py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-orange-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {subscribing ? 'Processing...' : ctaText}
          </button>

          {/* Feature list */}
          <div className="mt-6 space-y-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-holio-lavender/30 text-xl">
                  {f.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-holio-text">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-holio-muted">{f.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-holio-muted" />
              </div>
            ))}
          </div>

          {/* Restore */}
          <button className="mt-4 w-full pb-6 text-center text-sm text-holio-muted transition-colors hover:text-holio-text">
            Restore purchases
          </button>
        </div>
      </div>
    </div>
  )
}
