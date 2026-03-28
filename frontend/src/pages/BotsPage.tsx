import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
  Bot,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useBotStore } from '../stores/botStore'
import { useCompanyStore } from '../stores/companyStore'
import type { Bot as BotType, BotTemplate } from '../types'

type Tab = 'templates' | 'your-bots'

const TYPE_ICON: Record<string, typeof Bot> = {
  cfo: DollarSign,
  marketing: Megaphone,
  hr: Users,
  support: Headphones,
  devops: Server,
  custom: Bot,
}

const TYPE_COLOR: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  custom: 'bg-holio-dark',
}

const TYPE_COLOR_RING: Record<string, string> = {
  cfo: 'ring-emerald-200',
  marketing: 'ring-purple-200',
  hr: 'ring-blue-200',
  support: 'ring-orange-200',
  devops: 'ring-gray-200',
  custom: 'ring-gray-300',
}

const MODELS = [
  { id: 'anthropic.claude-3-sonnet', label: 'Claude Sonnet' },
  { id: 'amazon.nova-pro', label: 'Nova Pro' },
  { id: 'meta.llama3-70b', label: 'Llama 3' },
  { id: 'mistral.mistral-large', label: 'Mistral' },
]

function modelLabel(modelId: string): string {
  return MODELS.find((m) => m.id === modelId)?.label ?? modelId
}

const FALLBACK_TEMPLATES: BotTemplate[] = [
  {
    id: 'tpl-cfo',
    name: 'CFO Agent',
    description:
      'Financial analysis, budgeting, forecasting, and financial reporting assistant for your company.',
    category: 'cfo',
    defaultSystemPrompt:
      'You are a Chief Financial Officer AI assistant. Help with financial analysis, budgeting, forecasting, and reporting. Be precise with numbers and always cite your reasoning.',
    defaultModelId: 'anthropic.claude-3-sonnet',
    iconUrl: null,
  },
  {
    id: 'tpl-marketing',
    name: 'Marketing Agent',
    description:
      'Content creation, campaign strategy, social media, and brand voice management assistant.',
    category: 'marketing',
    defaultSystemPrompt:
      'You are a Marketing AI assistant. Help with content creation, campaign strategy, social media management, and brand positioning. Be creative and data-driven.',
    defaultModelId: 'anthropic.claude-3-sonnet',
    iconUrl: null,
  },
  {
    id: 'tpl-hr',
    name: 'HR Agent',
    description:
      'Employee onboarding, policy guidance, leave management, and team culture support.',
    category: 'hr',
    defaultSystemPrompt:
      'You are an HR AI assistant. Help with employee onboarding, policy questions, leave management, and team culture. Be empathetic and professional.',
    defaultModelId: 'amazon.nova-pro',
    iconUrl: null,
  },
  {
    id: 'tpl-support',
    name: 'Support Agent',
    description:
      'Customer-facing support bot that handles tickets, FAQs, and escalation workflows.',
    category: 'support',
    defaultSystemPrompt:
      'You are a Customer Support AI assistant. Answer questions clearly, follow escalation protocols, and maintain a friendly, helpful tone.',
    defaultModelId: 'anthropic.claude-3-sonnet',
    iconUrl: null,
  },
  {
    id: 'tpl-devops',
    name: 'DevOps Agent',
    description:
      'Infrastructure monitoring, CI/CD pipeline management, and incident response assistant.',
    category: 'devops',
    defaultSystemPrompt:
      'You are a DevOps AI assistant. Help with infrastructure monitoring, CI/CD pipelines, deployments, and incident response. Be technical and concise.',
    defaultModelId: 'meta.llama3-70b',
    iconUrl: null,
  },
  {
    id: 'tpl-custom',
    name: 'Custom Agent',
    description:
      'Start from scratch and define your own AI agent with a custom system prompt and configuration.',
    category: 'custom',
    defaultSystemPrompt: 'You are a helpful AI assistant.',
    defaultModelId: 'anthropic.claude-3-sonnet',
    iconUrl: null,
  },
]

interface BotConfigForm {
  name: string
  description: string
  type: BotType['type']
  systemPrompt: string
  modelId: string
  temperature: number
  maxTokens: number
}

const DEFAULT_FORM: BotConfigForm = {
  name: '',
  description: '',
  type: 'custom',
  systemPrompt: '',
  modelId: 'anthropic.claude-3-sonnet',
  temperature: 0.7,
  maxTokens: 2048,
}

export default function BotsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('templates')
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingBot, setEditingBot] = useState<BotType | null>(null)
  const [form, setForm] = useState<BotConfigForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const templates = useBotStore((s) => s.templates)
  const companyBots = useBotStore((s) => s.companyBots)
  const loading = useBotStore((s) => s.loading)
  const fetchTemplates = useBotStore((s) => s.fetchTemplates)
  const fetchCompanyBots = useBotStore((s) => s.fetchCompanyBots)
  const createBot = useBotStore((s) => s.createBot)
  const updateBot = useBotStore((s) => s.updateBot)
  const deleteBot = useBotStore((s) => s.deleteBot)

  useEffect(() => {
    fetchTemplates()
    if (activeCompany?.id) {
      fetchCompanyBots(activeCompany.id)
    }
  }, [activeCompany?.id, fetchTemplates, fetchCompanyBots])

  const displayTemplates =
    templates.length > 0 ? templates : FALLBACK_TEMPLATES

  const openCreateFromTemplate = useCallback(
    (template: BotTemplate) => {
      setEditingBot(null)
      setForm({
        name: template.name,
        description: template.description,
        type: (template.category as BotType['type']) || 'custom',
        systemPrompt: template.defaultSystemPrompt,
        modelId: template.defaultModelId,
        temperature: 0.7,
        maxTokens: 2048,
      })
      setShowConfigModal(true)
    },
    [],
  )

  const openCreateCustom = useCallback(() => {
    setEditingBot(null)
    setForm(DEFAULT_FORM)
    setShowConfigModal(true)
  }, [])

  const openEditBot = useCallback((bot: BotType) => {
    setEditingBot(bot)
    setForm({
      name: bot.name,
      description: bot.description ?? '',
      type: bot.type,
      systemPrompt: bot.systemPrompt,
      modelId: bot.modelId,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
    })
    setShowConfigModal(true)
  }, [])

  const handleSave = async () => {
    if (!activeCompany?.id || !form.name.trim()) return
    setSaving(true)
    try {
      if (editingBot) {
        await updateBot(editingBot.id, {
          name: form.name,
          description: form.description || undefined,
          systemPrompt: form.systemPrompt,
          modelId: form.modelId,
          temperature: form.temperature,
          maxTokens: form.maxTokens,
        })
      } else {
        await createBot({
          companyId: activeCompany.id,
          name: form.name,
          description: form.description || undefined,
          type: form.type,
          systemPrompt: form.systemPrompt,
          modelId: form.modelId,
          temperature: form.temperature,
          maxTokens: form.maxTokens,
        })
      }
      setShowConfigModal(false)
      setActiveTab('your-bots')
    } catch {
      // handled by store
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (botId: string) => {
    try {
      await deleteBot(botId)
    } catch {
      // handled by store
    }
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <button
          onClick={() => navigate('/chat')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-holio-orange" />
          <h1 className="text-xl font-bold text-holio-text">Bot Store</h1>
        </div>

        <div className="ml-6 flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'templates'
                ? 'bg-white text-holio-text shadow-sm'
                : 'text-holio-muted hover:text-holio-text',
            )}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('your-bots')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'your-bots'
                ? 'bg-white text-holio-text shadow-sm'
                : 'text-holio-muted hover:text-holio-text',
            )}
          >
            Your Bots
            {companyBots.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-holio-orange text-[10px] font-bold text-white">
                {companyBots.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {/* Templates tab */}
        {activeTab === 'templates' && !loading && (
          <div className="mx-auto max-w-5xl">
            <p className="mb-6 text-sm text-holio-muted">
              Choose a pre-configured AI agent template to get started quickly,
              or create a custom agent from scratch.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayTemplates.map((template) => {
                const category = template.category as BotType['type']
                const Icon = TYPE_ICON[category] ?? Bot
                const color = TYPE_COLOR[category] ?? TYPE_COLOR.custom
                const ring = TYPE_COLOR_RING[category] ?? TYPE_COLOR_RING.custom

                return (
                  <div
                    key={template.id}
                    className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full ring-4',
                          color,
                          ring,
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-holio-muted">
                        {modelLabel(template.defaultModelId)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-holio-text">
                      {template.name}
                    </h3>
                    <p className="mt-1 line-clamp-3 flex-1 text-sm text-holio-muted">
                      {template.description}
                    </p>
                    <button
                      onClick={() => openCreateFromTemplate(template)}
                      className="mt-4 w-full rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
                    >
                      Add to Company
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Your Bots tab */}
        {activeTab === 'your-bots' && !loading && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-holio-muted">
                {companyBots.length === 0
                  ? 'No bots yet. Create one from a template or build a custom agent.'
                  : `${companyBots.length} bot${companyBots.length !== 1 ? 's' : ''} configured`}
              </p>
              <button
                onClick={openCreateCustom}
                className="flex items-center gap-2 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
              >
                <Plus className="h-4 w-4" />
                Create Custom Bot
              </button>
            </div>

            <div className="space-y-2">
              {companyBots.map((bot) => {
                const Icon = TYPE_ICON[bot.type] ?? Bot
                const color = TYPE_COLOR[bot.type] ?? TYPE_COLOR.custom

                return (
                  <button
                    key={bot.id}
                    onClick={() => openEditBot(bot)}
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                        color,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-holio-text">
                        {bot.name}
                      </p>
                      {bot.description && (
                        <p className="truncate text-xs text-holio-muted">
                          {bot.description}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-holio-muted">
                      {bot.type}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-holio-muted">
                      {modelLabel(bot.modelId)}
                    </span>
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        bot.isActive ? 'bg-holio-sage' : 'bg-gray-300',
                      )}
                      title={bot.isActive ? 'Active' : 'Inactive'}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(bot.id)
                      }}
                      className="ml-2 rounded-full p-1.5 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </button>
                )
              })}
            </div>

            {companyBots.length === 0 && (
              <div className="mt-12 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/30">
                  <Bot className="h-8 w-8 text-holio-lavender" />
                </div>
                <h3 className="mt-4 font-semibold text-holio-text">
                  No bots yet
                </h3>
                <p className="mt-1 text-sm text-holio-muted">
                  Browse Templates to add a pre-built AI agent
                </p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="mt-4 rounded-lg bg-holio-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
                >
                  Browse Templates
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-holio-text">
                {editingBot ? 'Edit Bot' : 'Create Bot'}
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-holio-muted uppercase">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                  placeholder="My AI Agent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-holio-muted uppercase">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                  placeholder="Brief description of what this bot does"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-holio-muted uppercase">
                  System Prompt
                </label>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, systemPrompt: e.target.value }))
                  }
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                  placeholder="You are a helpful AI assistant..."
                />
              </div>

              {/* Model */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-holio-muted uppercase">
                  Model
                </label>
                <select
                  value={form.modelId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, modelId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold text-holio-muted uppercase">
                  <span>Temperature</span>
                  <span className="font-mono text-holio-text">
                    {form.temperature.toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={form.temperature}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-holio-orange"
                />
                <div className="flex justify-between text-[10px] text-holio-muted">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-holio-muted uppercase">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min={256}
                  max={4096}
                  step={256}
                  value={form.maxTokens}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxTokens: parseInt(e.target.value) || 2048,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
              >
                {saving
                  ? 'Saving…'
                  : editingBot
                    ? 'Save Changes'
                    : 'Create Bot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
