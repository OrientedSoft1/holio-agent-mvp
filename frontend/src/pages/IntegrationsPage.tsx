import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  Cloud,
  Webhook,
  Key,
  Zap,
  Bell,
  Globe,
  ShieldCheck,
  Puzzle,
} from 'lucide-react'
import { cn } from '../lib/utils'

type Category = 'all' | 'ai' | 'automation' | 'developer'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  category: Category[]
  connected: boolean
  configurable: boolean
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI & Models' },
  { id: 'automation', label: 'Automation' },
  { id: 'developer', label: 'Developer' },
]

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'aws-bedrock',
    name: 'AWS Bedrock',
    description:
      'Foundation models for AI agents — Claude, Nova, Llama, Mistral and more.',
    icon: Cloud,
    iconBg: 'bg-[#232F3E]',
    category: ['ai'],
    connected: true,
    configurable: true,
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description:
      'Send real-time event notifications to external services via HTTP callbacks.',
    icon: Webhook,
    iconBg: 'bg-purple-500',
    category: ['developer', 'automation'],
    connected: false,
    configurable: false,
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    description:
      'Generate and manage API keys for programmatic access to Holio.',
    icon: Key,
    iconBg: 'bg-holio-dark',
    category: ['developer'],
    connected: true,
    configurable: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description:
      'Connect Holio to 6,000+ apps with no-code automation workflows.',
    icon: Zap,
    iconBg: 'bg-[#FF4A00]',
    category: ['automation'],
    connected: false,
    configurable: false,
  },
  {
    id: 'notifications',
    name: 'External Notifications',
    description:
      'Push alerts to email, SMS, or third-party services when key events occur.',
    icon: Bell,
    iconBg: 'bg-rose-500',
    category: ['automation'],
    connected: false,
    configurable: false,
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Serve your Holio workspace from a branded custom domain.',
    icon: Globe,
    iconBg: 'bg-teal-500',
    category: ['developer'],
    connected: false,
    configurable: false,
  },
  {
    id: 'sso',
    name: 'SSO',
    description:
      'Single sign-on via SAML or OIDC for enterprise identity management.',
    icon: ShieldCheck,
    iconBg: 'bg-blue-600',
    category: ['developer'],
    connected: false,
    configurable: true,
  },
]

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)

  const filtered =
    activeCategory === 'all'
      ? integrations
      : integrations.filter((i) => i.category.includes(activeCategory))

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
    )
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#D1CBFB] to-[#FF9220] px-6 pb-8 pt-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate('/chat')}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <Puzzle className="h-7 w-7 text-white" />
            <h1 className="text-3xl font-bold text-white">Integrations</h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Connect external services, configure AI models, and extend your
            workspace with powerful third-party tools.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="mx-auto flex max-w-5xl gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'relative pb-3 pt-4 text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'text-holio-text'
                  : 'text-holio-muted hover:text-holio-text',
              )}
            >
              {cat.label}
              {activeCategory === cat.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-holio-orange" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      integration.iconBg,
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={cn(
                      'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                      integration.connected
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-holio-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        integration.connected ? 'bg-green-500' : 'bg-gray-400',
                      )}
                    />
                    {integration.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-holio-text">
                  {integration.name}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-holio-muted">
                  {integration.description}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleConnection(integration.id)}
                    className={cn(
                      'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                      integration.connected ? 'bg-holio-orange' : 'bg-gray-300',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        integration.connected ? 'translate-x-5' : '',
                      )}
                    />
                  </button>
                  <span className="text-xs text-holio-muted">
                    {integration.connected ? 'Enabled' : 'Disabled'}
                  </span>

                  {integration.configurable && (
                    <button
                      onClick={() => navigate('/company-settings')}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
                      title="Configure"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <Puzzle className="mb-3 h-12 w-12 text-holio-muted opacity-30" />
            <p className="text-sm text-holio-muted">
              No integrations in this category.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
