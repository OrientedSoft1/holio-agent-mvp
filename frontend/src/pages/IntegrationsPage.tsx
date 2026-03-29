<<<<<<< Updated upstream
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
=======
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronRight,
  ArrowRightLeft,
  Save,
  Music,
  Mail,
  Twitter,
  BookOpen,
  MessageCircle,
  Youtube,
  Pen,
  Instagram,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowDown,
} from 'lucide-react'
import { cn } from '../lib/utils'

type View = 'list' | 'detail' | 'new'

interface Integration {
  id: string
  service: ServiceKey
  name: string
  lastActivity: string
  isActive: boolean
  triggerAction: string
  responseAction: string
  logs: ActionLog[]
}

interface ActionLog {
  id: string
  timestamp: string
  action: string
  status: 'success' | 'error'
}

type ServiceKey =
  | 'spotify'
  | 'gmail'
  | 'x'
  | 'notion'
  | 'discord'
  | 'youtube'
  | 'wordpress'
  | 'instagram'

interface ServiceDef {
  key: ServiceKey
  label: string
  icon: typeof Music
  bg: string
}

const SERVICES: ServiceDef[] = [
  { key: 'spotify', label: 'Spotify', icon: Music, bg: 'bg-green-500' },
  { key: 'gmail', label: 'Gmail', icon: Mail, bg: 'bg-red-500' },
  { key: 'x', label: 'X', icon: Twitter, bg: 'bg-gray-900' },
  { key: 'notion', label: 'Notion', icon: BookOpen, bg: 'bg-gray-800' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, bg: 'bg-indigo-500' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, bg: 'bg-red-600' },
  { key: 'wordpress', label: 'WordPress', icon: Pen, bg: 'bg-blue-600' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, bg: 'bg-pink-500' },
]

const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.key, s])) as Record<ServiceKey, ServiceDef>

const TRIGGER_OPTIONS: Record<ServiceKey, string[]> = {
  spotify: ['New track saved', 'Playlist updated', 'Artist followed'],
  gmail: ['New email received', 'Email labeled', 'Email starred'],
  x: ['New mention', 'New follower', 'Post liked'],
  notion: ['Page created', 'Database updated', 'Comment added'],
  discord: ['Message posted', 'Member joined', 'Reaction added'],
  youtube: ['Video uploaded', 'Comment received', 'Subscriber gained'],
  wordpress: ['Post published', 'Comment posted', 'Page updated'],
  instagram: ['New post', 'Story viewed', 'Comment received'],
}

const RESPONSE_OPTIONS: Record<ServiceKey, string[]> = {
  spotify: ['Add to playlist', 'Create playlist', 'Share track'],
  gmail: ['Send email', 'Apply label', 'Archive thread'],
  x: ['Post reply', 'Repost', 'Send DM'],
  notion: ['Create page', 'Update database', 'Add comment'],
  discord: ['Send message', 'Create channel', 'Assign role'],
  youtube: ['Post comment', 'Add to playlist', 'Share video'],
  wordpress: ['Create draft', 'Publish post', 'Update page'],
  instagram: ['Post image', 'Reply to comment', 'Send DM'],
}

const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    service: 'gmail',
    name: 'Email Notifications',
    lastActivity: '2 min ago',
    isActive: true,
    triggerAction: 'New email received',
    responseAction: 'Send message',
    logs: [
      { id: 'l1', timestamp: '12:34 PM', action: 'Triggered: New email received', status: 'success' },
      { id: 'l2', timestamp: '12:34 PM', action: 'Response: Send message', status: 'success' },
      { id: 'l3', timestamp: '11:02 AM', action: 'Triggered: New email received', status: 'error' },
    ],
  },
  {
    id: '2',
    service: 'discord',
    name: 'Team Alerts',
    lastActivity: '1 hour ago',
    isActive: true,
    triggerAction: 'Message posted',
    responseAction: 'Create page',
    logs: [
      { id: 'l4', timestamp: '11:30 AM', action: 'Triggered: Message posted', status: 'success' },
      { id: 'l5', timestamp: '11:30 AM', action: 'Response: Create page', status: 'success' },
    ],
  },
  {
    id: '3',
    service: 'notion',
    name: 'Doc Sync',
    lastActivity: 'Yesterday',
    isActive: false,
    triggerAction: 'Page created',
    responseAction: 'Publish post',
    logs: [
      { id: 'l6', timestamp: 'Yesterday', action: 'Triggered: Page created', status: 'success' },
    ],
>>>>>>> Stashed changes
  },
]

export default function IntegrationsPage() {
  const navigate = useNavigate()
<<<<<<< Updated upstream
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
=======
  const [view, setView] = useState<View>('list')
  const [search, setSearch] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceKey | null>(null)
  const [newName, setNewName] = useState('')

  const [triggerAction, setTriggerAction] = useState('')
  const [responseAction, setResponseAction] = useState('')

  const filteredIntegrations = useMemo(() => {
    if (!search.trim()) return MOCK_INTEGRATIONS
    const q = search.toLowerCase()
    return MOCK_INTEGRATIONS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        SERVICE_MAP[i.service].label.toLowerCase().includes(q),
    )
  }, [search])

  const openDetail = (integration: Integration) => {
    setSelectedIntegration(integration)
    setTriggerAction(integration.triggerAction)
    setResponseAction(integration.responseAction)
    setView('detail')
  }

  const openNew = () => {
    setSelectedService(null)
    setNewName('')
    setView('new')
  }

  const goBack = () => {
    setView('list')
    setSelectedIntegration(null)
    setSelectedService(null)
>>>>>>> Stashed changes
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
<<<<<<< Updated upstream
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
=======
      {/* ─── LIST VIEW ─── */}
      {view === 'list' && (
        <>
          <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <button
              onClick={() => navigate('/chat')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-holio-orange" />
              <h1 className="text-xl font-bold text-holio-text">
                Manage Integrations
              </h1>
            </div>

            <div className="relative ml-auto w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-holio-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-2">
              {filteredIntegrations.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <ArrowRightLeft className="mb-3 h-12 w-12 text-holio-muted/30" />
                  <p className="text-sm text-holio-muted">
                    No integrations found.
                  </p>
                </div>
              )}

              {filteredIntegrations.map((integration) => {
                const svc = SERVICE_MAP[integration.service]
                const Icon = svc.icon
                return (
                  <button
                    key={integration.id}
                    onClick={() => openDetail(integration)}
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full',
                        svc.bg,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-holio-text">
                        {integration.name}
                      </p>
                      <p className="text-xs text-holio-muted">
                        {svc.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-holio-muted">
                        <Clock className="h-3.5 w-3.5" />
                        {integration.lastActivity}
                      </div>
                      <div
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          integration.isActive ? 'bg-holio-sage' : 'bg-gray-300',
                        )}
                        title={integration.isActive ? 'Active' : 'Inactive'}
                      />
                      <ChevronRight className="h-4 w-4 text-holio-muted" />
                    </div>
                  </button>
                )
              })}
            </div>
          </main>

          <button
            onClick={openNew}
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-holio-orange shadow-lg shadow-holio-orange/30 transition-transform hover:scale-105 md:bottom-6 md:right-6"
            aria-label="New integration"
          >
            <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* ─── DETAIL VIEW ─── */}
      {view === 'detail' && selectedIntegration && (
        <>
          <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <button
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {(() => {
              const svc = SERVICE_MAP[selectedIntegration.service]
              const Icon = svc.icon
              return (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full',
                      svc.bg,
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-holio-text">
                    {selectedIntegration.name}
                  </h1>
                </div>
              )
            })()}
            <div
              className={cn(
                'ml-3 h-2.5 w-2.5 rounded-full',
                selectedIntegration.isActive ? 'bg-holio-sage' : 'bg-gray-300',
              )}
            />
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold text-holio-text">
                  Action Flow
                </h2>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-full">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-holio-muted">
                      When this happens…
                    </label>
                    <select
                      value={triggerAction}
                      onChange={(e) => setTriggerAction(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                    >
                      <option value="" disabled>
                        Select trigger…
                      </option>
                      {TRIGGER_OPTIONS[selectedIntegration.service].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col items-center py-1">
                    <div className="h-6 w-px bg-holio-orange/40" />
                    <ArrowDown className="h-4 w-4 text-holio-orange" />
                  </div>

                  <div className="w-full">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-holio-muted">
                      …then do this
                    </label>
                    <select
                      value={responseAction}
                      onChange={(e) => setResponseAction(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                    >
                      <option value="" disabled>
                        Select response…
                      </option>
                      {RESPONSE_OPTIONS[selectedIntegration.service].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-lg bg-holio-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90">
                  <Save className="mr-2 inline-block h-4 w-4" />
                  Save Actions
                </button>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-holio-text">
                  Action Logs
                </h2>

                {selectedIntegration.logs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-holio-muted">
                    No activity recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedIntegration.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5"
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-holio-sage" />
                        ) : (
                          <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                        )}
                        <span className="flex-1 text-sm text-holio-text">
                          {log.action}
                        </span>
                        <span className="text-xs text-holio-muted">
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </>
      )}

      {/* ─── NEW INTEGRATION VIEW ─── */}
      {view === 'new' && (
        <>
          <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <button
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-holio-orange" />
              <h1 className="text-xl font-bold text-holio-text">
                New Integration
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-6 text-lg font-bold text-holio-text">
                Select Service
              </h2>

              <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                {SERVICES.map((svc) => {
                  const Icon = svc.icon
                  const isSelected = selectedService === svc.key
                  return (
                    <button
                      key={svc.key}
                      onClick={() => setSelectedService(svc.key)}
                      className={cn(
                        'flex flex-col items-center gap-2.5 rounded-xl border-2 p-5 transition-all',
                        isSelected
                          ? 'border-holio-orange bg-holio-orange/5 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-holio-lavender hover:bg-gray-50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full',
                          svc.bg,
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-holio-orange' : 'text-holio-text',
                        )}
                      >
                        {svc.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selectedService && (
                <div className="mt-6">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-holio-muted">
                    Integration Name
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`My ${SERVICE_MAP[selectedService].label} integration`}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-holio-text outline-none placeholder:text-holio-muted focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                  />
                </div>
              )}

              <button
                disabled={!selectedService || !newName.trim()}
                onClick={goBack}
                className="mt-6 w-full rounded-lg bg-holio-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Integration
              </button>
            </div>
          </main>
        </>
      )}
>>>>>>> Stashed changes
    </div>
  )
}
