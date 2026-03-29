import { useState } from 'react'
import { Sparkles, ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

type Plan = 'annual' | 'monthly'

const ANNUAL_PRICE_PER_MONTH = 3.99
const MONTHLY_PRICE = 6.99
const ANNUAL_TOTAL = +(ANNUAL_PRICE_PER_MONTH * 12).toFixed(2)

const FEATURES = [
  {
    emoji: '🔮',
    title: 'Upgraded Stories',
    subtitle: 'Priority ordering, stealth mode, permanent stories',
  },
  {
    emoji: '📈',
    title: 'Doubled Limits',
    subtitle: 'Up to 1 000 channels, 200 folders, 10 pins',
  },
  {
    emoji: '📎',
    title: '4 GB Upload',
    subtitle: 'Upload files up to 4 GB each with faster speeds',
  },
]

export default function HolioProPage() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan>('annual')

  const ctaLabel =
    plan === 'annual'
      ? `Subscribe for $${ANNUAL_TOTAL.toFixed(2)} / year`
      : `Subscribe for $${MONTHLY_PRICE.toFixed(2)} / month`

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 bg-white px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-holio-text">Holio Pro</h1>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto">
        {/* Hero gradient section */}
        <div className="flex w-full flex-col items-center bg-gradient-to-br from-[#D1CBFB] to-[#FF9220] px-6 pb-14 pt-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-lg backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-5 text-3xl font-black text-white">Holio Pro</h2>
          <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-white/90">
            Go beyond the limits — unlock upgraded stories, doubled limits,
            massive uploads, and more.
          </p>
        </div>

        {/* Content area */}
        <div className="w-full max-w-md px-5 pb-10 pt-8">
          {/* Pricing cards */}
          <div className="flex gap-3">
            {/* Annual card */}
            <button
              onClick={() => setPlan('annual')}
              className={cn(
                'relative flex flex-1 flex-col rounded-2xl border-2 p-4 text-left transition-all',
                plan === 'annual'
                  ? 'border-holio-orange bg-holio-orange/5'
                  : 'border-gray-200 bg-white',
              )}
            >
              <span className="absolute -top-2.5 right-3 rounded-full bg-holio-orange px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                −40%
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                    plan === 'annual'
                      ? 'border-holio-orange bg-holio-orange'
                      : 'border-gray-300',
                  )}
                >
                  {plan === 'annual' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-holio-text">Annual</span>
              </div>
              <p className="mt-3 text-xl font-black text-holio-text">
                ${ANNUAL_PRICE_PER_MONTH.toFixed(2)}
                <span className="text-sm font-normal text-holio-muted"> / mo</span>
              </p>
              <p className="mt-0.5 text-xs text-holio-muted">
                ${ANNUAL_TOTAL.toFixed(2)} billed annually
              </p>
            </button>

            {/* Monthly card */}
            <button
              onClick={() => setPlan('monthly')}
              className={cn(
                'flex flex-1 flex-col rounded-2xl border-2 p-4 text-left transition-all',
                plan === 'monthly'
                  ? 'border-holio-orange bg-holio-orange/5'
                  : 'border-gray-200 bg-white',
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                    plan === 'monthly'
                      ? 'border-holio-orange bg-holio-orange'
                      : 'border-gray-300',
                  )}
                >
                  {plan === 'monthly' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-holio-text">Monthly</span>
              </div>
              <p className="mt-3 text-xl font-black text-holio-text">
                ${MONTHLY_PRICE.toFixed(2)}
                <span className="text-sm font-normal text-holio-muted"> / mo</span>
              </p>
              <p className="mt-0.5 text-xs text-holio-muted">
                Billed monthly, cancel anytime
              </p>
            </button>
          </div>

          {/* CTA button */}
          <button className="mt-6 h-14 w-full rounded-xl bg-holio-orange text-base font-bold text-white shadow-md transition-colors hover:bg-orange-500 active:scale-[0.98]">
            {ctaLabel}
          </button>

          {/* Feature list */}
          <div className="mt-8 space-y-1">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 rounded-xl px-1 py-3 transition-colors hover:bg-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-holio-lavender/30 text-xl">
                  {f.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-holio-text">{f.title}</p>
                  <p className="text-xs leading-snug text-holio-muted">{f.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-holio-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}