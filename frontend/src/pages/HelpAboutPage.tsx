import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ExternalLink, RefreshCw, HelpCircle, Shield, FileText, Mail, Heart } from 'lucide-react'
import { cn } from '../lib/utils'
import api from '../services/api.service'
import { FAQ_ITEMS } from '../config/faq'

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export default function HelpAboutPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [upToDate, setUpToDate] = useState(false)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const checkForUpdates = async () => {
    setChecking(true)
    setUpToDate(false)
    try {
      const { data } = await api.get<{ hasUpdate: boolean; latestVersion?: string }>('/app/check-update', { params: { currentVersion: APP_VERSION } })
      if (data.hasUpdate && data.latestVersion) {
        setUpToDate(false)
      } else {
        setUpToDate(true)
      }
    } catch {
      setUpToDate(true)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">Help</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* App Identity */}
        <div className="flex flex-col items-center px-4 pt-4 pb-2">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-holio-dark shadow-lg">
            <span className="text-xl font-black tracking-wider text-white">HOLIO</span>
          </div>
          <h2 className="text-lg font-bold text-holio-text">Holio Agent</h2>
          <p className="text-sm text-holio-muted">v{APP_VERSION}</p>
        </div>

        <div className="px-4 pb-4">
          <p className="text-center text-sm leading-relaxed text-holio-muted">
            Holio Agent is a corporate AI messaging platform that combines
            powerful real-time communication with intelligent AI agents to help
            your team work smarter and faster.
          </p>
        </div>

        {/* Check for Updates */}
        <div className="mx-4 mb-2 rounded-2xl bg-white dark:bg-gray-900">
          <button
            onClick={checkForUpdates}
            disabled={checking}
            className="flex w-full items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={cn('h-5 w-5 text-holio-orange', checking && 'animate-spin')} />
              <span className="text-sm font-medium text-holio-text">
                {checking ? 'Checking for updates...' : 'Check for Updates'}
              </span>
            </div>
            {upToDate && !checking && (
              <span className="text-xs font-medium text-holio-sage">Up to date</span>
            )}
          </button>
        </div>

        {/* FAQ */}
        <SectionLabel>Frequently Asked Questions</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              {i > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />}
              <button
                onClick={() => toggleFaq(i)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <HelpCircle className="h-4.5 w-4.5 flex-shrink-0 text-holio-orange" />
                <span className="min-w-0 flex-1 text-sm font-medium text-holio-text">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 flex-shrink-0 text-holio-muted transition-transform duration-200',
                    openFaq === i && 'rotate-180',
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  openFaq === i ? 'max-h-48' : 'max-h-0',
                )}
              >
                <p className="px-4 pb-3.5 pl-11.5 text-sm leading-relaxed text-holio-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <SectionLabel>Legal & Support</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <LinkRow icon={Shield} label="Privacy Policy" href="https://holio.app/privacy" />
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <LinkRow icon={FileText} label="Terms of Service" href="https://holio.app/terms" />
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <LinkRow icon={Mail} label="Contact Support" href="mailto:support@holio.app" />
        </div>

        {/* Credits */}
        <SectionLabel>Credits</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white p-4 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-holio-orange" />
            <div>
              <p className="text-sm leading-relaxed text-holio-muted">
                Built with care by the Holio team. Powered by React, NestJS, and
                AWS Bedrock. Special thanks to our early adopters and contributors
                who helped shape this product.
              </p>
              <p className="mt-2 text-xs text-holio-muted">
                &copy; {new Date().getFullYear()} Holio Agent. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
      {children}
    </p>
  )
}

function LinkRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <Icon className="h-4.5 w-4.5 text-holio-muted" />
      <span className="flex-1 text-sm text-holio-text">{label}</span>
      <ExternalLink className="h-4 w-4 text-holio-muted" />
    </a>
  )
}
