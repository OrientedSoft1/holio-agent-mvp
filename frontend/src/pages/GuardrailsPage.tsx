import { useState, useEffect } from 'react'
import {
  Shield, Plus, Trash2, Eye, AlertTriangle,
  CheckCircle2, XCircle, Loader2, X, Info,
} from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { useGuardrailStore } from '../stores/guardrailStore'
import { useCompanyStore } from '../stores/companyStore'
import { cn } from '../lib/utils'
import type { Guardrail, GuardrailTestResult } from '../types'

type CreateTab = 'general' | 'content' | 'topics' | 'words' | 'pii'

const STATUS_STYLE: Record<string, string> = {
  READY: 'bg-green-100 text-green-700',
  CREATING: 'bg-yellow-100 text-yellow-700',
  VERSIONING: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
}

const CONTENT_FILTERS = [
  { type: 'HATE', label: 'Hate speech', desc: 'Discriminatory or hateful language targeting identity groups' },
  { type: 'INSULTS', label: 'Insults', desc: 'Demeaning, belittling, or offensive remarks' },
  { type: 'SEXUAL', label: 'Sexual content', desc: 'Sexually explicit or suggestive language' },
  { type: 'VIOLENCE', label: 'Violence', desc: 'Threats, graphic violence, or harm encouragement' },
  { type: 'MISCONDUCT', label: 'Misconduct', desc: 'Illegal activities, fraud, or dangerous instructions' },
]

const STRENGTHS = [
  { value: 'NONE', label: 'Off' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

const PII_TYPES = [
  { type: 'EMAIL', label: 'Email addresses', desc: 'Detect and handle email addresses' },
  { type: 'PHONE', label: 'Phone numbers', desc: 'Detect and handle phone numbers' },
  { type: 'SSN', label: 'Social security numbers', desc: 'Detect US SSNs and similar national IDs' },
  { type: 'CREDIT_CARD', label: 'Credit card numbers', desc: 'Detect payment card numbers' },
]

const PII_ACTIONS = [
  { value: 'BLOCK', label: 'Block', desc: 'Reject the message entirely' },
  { value: 'ANONYMIZE', label: 'Anonymize', desc: 'Replace with placeholders' },
]

const CONTENT_FILTER_LABEL: Record<string, string> = Object.fromEntries(
  CONTENT_FILTERS.map((f) => [f.type, f.label]),
)
const STRENGTH_LABEL: Record<string, string> = Object.fromEntries(
  STRENGTHS.map((s) => [s.value, s.label]),
)
const PII_LABEL: Record<string, string> = Object.fromEntries(
  PII_TYPES.map((p) => [p.type, p.label]),
)
const PII_ACTION_LABEL: Record<string, string> = Object.fromEntries(
  PII_ACTIONS.map((a) => [a.value, a.label]),
)

const TAB_HELP: Record<CreateTab, string> = {
  general: 'Give your guardrail a name and customize the messages users see when content is blocked.',
  content: 'Set filtering strength for different content categories. Filters apply independently to user inputs and AI outputs.',
  topics: 'Define topics that the AI must never discuss. Provide a clear name and a detailed definition so the model can reliably identify the topic.',
  words: 'List specific words or phrases that should always be blocked, regardless of context.',
  pii: 'Choose which types of personal data to detect. You can block the message or anonymize the data by replacing it with placeholders.',
}

interface ContentFilter {
  type: string
  inputStrength: string
  outputStrength: string
}

interface DeniedTopic {
  name: string
  definition: string
}

interface PiiEntry {
  type: string
  action: string
}

interface CreateForm {
  name: string
  description: string
  blockedInputMessaging: string
  blockedOutputsMessaging: string
  contentFilters: ContentFilter[]
  deniedTopics: DeniedTopic[]
  wordFilters: string
  piiEntries: PiiEntry[]
}

const DEFAULT_FORM: CreateForm = {
  name: '',
  description: '',
  blockedInputMessaging: 'Your input was blocked by a guardrail.',
  blockedOutputsMessaging: 'The response was blocked by a guardrail.',
  contentFilters: CONTENT_FILTERS.map((f) => ({
    type: f.type, inputStrength: 'NONE', outputStrength: 'NONE',
  })),
  deniedTopics: [],
  wordFilters: '',
  piiEntries: [],
}

export default function GuardrailsPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const guardrails = useGuardrailStore((s) => s.guardrails)
  const selectedGuardrail = useGuardrailStore((s) => s.selectedGuardrail)
  const loading = useGuardrailStore((s) => s.loading)
  const fetchGuardrails = useGuardrailStore((s) => s.fetchGuardrails)
  const fetchGuardrailDetail = useGuardrailStore((s) => s.fetchGuardrailDetail)
  const createGuardrail = useGuardrailStore((s) => s.createGuardrail)
  const deleteGuardrail = useGuardrailStore((s) => s.deleteGuardrail)
  const testGuardrail = useGuardrailStore((s) => s.testGuardrail)

  const [showCreate, setShowCreate] = useState(false)
  const [createTab, setCreateTab] = useState<CreateTab>('general')
  const [form, setForm] = useState<CreateForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [topicName, setTopicName] = useState('')
  const [topicDef, setTopicDef] = useState('')

  const [detailId, setDetailId] = useState<string | null>(null)
  const [testContent, setTestContent] = useState('')
  const [testSource, setTestSource] = useState<'INPUT' | 'OUTPUT'>('INPUT')
  const [testResult, setTestResult] = useState<GuardrailTestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Guardrail | null>(null)

  useEffect(() => {
    if (activeCompany?.id) fetchGuardrails(activeCompany.id)
  }, [activeCompany?.id, fetchGuardrails])

  if (!activeCompany) {
    return (
      <div className="flex h-full items-center justify-center bg-holio-offwhite">
        <p className="text-holio-muted">Select a company to manage guardrails.</p>
      </div>
    )
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await createGuardrail(activeCompany.id, {
        name: form.name,
        description: form.description || undefined,
        blockedInputMessaging: form.blockedInputMessaging || undefined,
        blockedOutputsMessaging: form.blockedOutputsMessaging || undefined,
        contentFilters: form.contentFilters.filter(
          (f) => f.inputStrength !== 'NONE' || f.outputStrength !== 'NONE',
        ),
        deniedTopics: form.deniedTopics.length ? form.deniedTopics : undefined,
        wordFilters: form.wordFilters.trim()
          ? form.wordFilters.split(',').map((w) => w.trim()).filter(Boolean)
          : undefined,
        sensitiveInfoTypes: form.piiEntries.length ? form.piiEntries : undefined,
      })
      setShowCreate(false)
      setForm(DEFAULT_FORM)
      setCreateTab('general')
    } catch {
      // handled by store
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGuardrail(activeCompany.id, id)
      if (detailId === id) {
        setDetailId(null)
        setTestResult(null)
      }
    } catch {
      // handled by store
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleView = async (g: Guardrail) => {
    setDetailId(g.guardrailId)
    setTestResult(null)
    setTestContent('')
    await fetchGuardrailDetail(activeCompany.id, g.guardrailId)
  }

  const handleTest = async () => {
    if (!detailId || !testContent.trim()) return
    setTesting(true)
    try {
      const result = await testGuardrail(activeCompany.id, detailId, testContent, testSource)
      setTestResult(result)
    } catch {
      // handled by store
    } finally {
      setTesting(false)
    }
  }

  const addTopic = () => {
    if (!topicName.trim() || !topicDef.trim()) return
    setForm((f) => ({
      ...f,
      deniedTopics: [...f.deniedTopics, { name: topicName.trim(), definition: topicDef.trim() }],
    }))
    setTopicName('')
    setTopicDef('')
  }

  const togglePii = (type: string) => {
    setForm((f) => {
      const exists = f.piiEntries.find((p) => p.type === type)
      if (exists) return { ...f, piiEntries: f.piiEntries.filter((p) => p.type !== type) }
      return { ...f, piiEntries: [...f.piiEntries, { type, action: 'BLOCK' }] }
    })
  }

  const setPiiAction = (type: string, action: string) => {
    setForm((f) => ({
      ...f,
      piiEntries: f.piiEntries.map((p) => (p.type === type ? { ...p, action } : p)),
    }))
  }

  const detail = detailId ? selectedGuardrail : null
  const CREATE_TABS: { key: CreateTab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'content', label: 'Content Filters' },
    { key: 'topics', label: 'Topics' },
    { key: 'words', label: 'Words' },
    { key: 'pii', label: 'PII Detection' },
  ]

  const tabFilled: Record<CreateTab, boolean> = {
    general: form.name.trim().length > 0,
    content: form.contentFilters.some((f) => f.inputStrength !== 'NONE' || f.outputStrength !== 'NONE'),
    topics: form.deniedTopics.length > 0,
    words: form.wordFilters.trim().length > 0,
    pii: form.piiEntries.length > 0,
  }

  const parsedWords = form.wordFilters
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30'
  const labelCls = 'mb-1 block text-xs font-semibold uppercase text-holio-muted'

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-holio-orange" />
          <h1 className="text-xl font-bold text-holio-text">Guardrails</h1>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateTab('general'); setForm(DEFAULT_FORM) }}
          className="flex items-center gap-2 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
        >
          <Plus className="h-4 w-4" />
          Create Guardrail
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-holio-orange" />
            </div>
          )}

          {!loading && guardrails.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/30">
                <Shield className="h-8 w-8 text-holio-lavender" />
              </div>
              <h3 className="mt-4 font-semibold text-holio-text">No guardrails yet</h3>
              <p className="mt-1 text-sm text-holio-muted">
                Create a guardrail to control AI model inputs and outputs.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 rounded-lg bg-holio-orange px-6 py-2 text-sm font-semibold text-white hover:bg-holio-orange/90"
              >
                Create Guardrail
              </button>
            </div>
          )}

          {!loading && guardrails.length > 0 && (
            <div className="mx-auto max-w-4xl space-y-3">
              {guardrails.map((g) => (
                <div
                  key={g.guardrailId}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm transition-colors',
                    detailId === g.guardrailId ? 'border-holio-orange' : 'border-gray-100',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-holio-text">{g.name}</p>
                    {g.description && (
                      <p className="mt-0.5 truncate text-xs text-holio-muted">{g.description}</p>
                    )}
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', STATUS_STYLE[g.status] ?? 'bg-gray-100 text-gray-600')}>
                    {g.status}
                  </span>
                  <span className="text-xs text-holio-muted">v{g.version}</span>
                  <button
                    onClick={() => handleView(g)}
                    className="rounded-lg border border-gray-200 p-2 text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(g)}
                    className="rounded-lg border border-gray-200 p-2 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {detail && detailId && (
          <aside className="w-[420px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-holio-text">{detail.name}</h2>
              <button onClick={() => { setDetailId(null); setTestResult(null) }} className="text-holio-muted hover:text-holio-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            {detail.description && <p className="mb-4 text-sm text-holio-muted">{detail.description}</p>}

            <div className="space-y-4 text-sm">
              <div>
                <span className={labelCls}>Status</span>
                <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[detail.status] ?? 'bg-gray-100 text-gray-600')}>{detail.status}</span>
              </div>
              <div>
                <span className={labelCls}>Version</span>
                <p className="text-holio-text">{detail.version}</p>
              </div>

              {detail.contentPolicy && detail.contentPolicy.filters.length > 0 && (
                <div>
                  <span className={labelCls}>Content Filters</span>
                  <div className="space-y-1">
                    {detail.contentPolicy.filters.map((f) => (
                      <div key={f.type} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs">
                        <span className="font-medium">{CONTENT_FILTER_LABEL[f.type] ?? f.type}</span>
                        <span>In: {STRENGTH_LABEL[f.inputStrength] ?? f.inputStrength} / Out: {STRENGTH_LABEL[f.outputStrength] ?? f.outputStrength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.topicPolicy && detail.topicPolicy.topics.length > 0 && (
                <div>
                  <span className={labelCls}>Denied Topics</span>
                  <div className="space-y-1">
                    {detail.topicPolicy.topics.map((t) => (
                      <div key={t.name} className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs">
                        <span className="font-medium">{t.name}</span>
                        <p className="text-holio-muted">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.wordPolicy && detail.wordPolicy.words.length > 0 && (
                <div>
                  <span className={labelCls}>Blocked Words</span>
                  <div className="flex flex-wrap gap-1">
                    {detail.wordPolicy.words.map((w) => (
                      <span key={w.text} className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">{w.text}</span>
                    ))}
                  </div>
                </div>
              )}

              {detail.sensitiveInformationPolicy && detail.sensitiveInformationPolicy.piiEntities.length > 0 && (
                <div>
                  <span className={labelCls}>PII Detection</span>
                  <div className="space-y-1">
                    {detail.sensitiveInformationPolicy.piiEntities.map((p) => (
                      <div key={p.type} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs">
                        <span className="font-medium">{PII_LABEL[p.type] ?? p.type}</span>
                        <span className={cn('rounded-full px-2 py-0.5 font-medium', p.action === 'BLOCK' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600')}>{PII_ACTION_LABEL[p.action] ?? p.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="mb-1 text-sm font-bold text-holio-text">Test Guardrail</h3>
              <p className="mb-3 text-xs text-holio-muted">Enter sample text to check if this guardrail would block or modify it.</p>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                rows={3}
                className={cn(inputCls, 'resize-none')}
                placeholder="Type or paste content to test..."
              />
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-holio-muted cursor-pointer">
                  <input type="radio" name="testSource" checked={testSource === 'INPUT'} onChange={() => setTestSource('INPUT')} className="accent-holio-orange" />
                  Test as user input
                </label>
                <label className="flex items-center gap-1.5 text-xs text-holio-muted cursor-pointer">
                  <input type="radio" name="testSource" checked={testSource === 'OUTPUT'} onChange={() => setTestSource('OUTPUT')} className="accent-holio-orange" />
                  Test as AI output
                </label>
                <button
                  onClick={handleTest}
                  disabled={testing || !testContent.trim()}
                  className="ml-auto rounded-lg bg-holio-orange px-4 py-1.5 text-xs font-semibold text-white hover:bg-holio-orange/90 disabled:opacity-50"
                >
                  {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Test'}
                </button>
              </div>

              {testResult && (
                <div className={cn('mt-3 rounded-xl p-3', testResult.action === 'NONE' ? 'bg-green-50' : 'bg-red-50')}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {testResult.action === 'NONE' ? (
                      <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">Passed</span></>
                    ) : (
                      <><AlertTriangle className="h-4 w-4 text-red-600" /><span className="text-red-700">Guardrail Intervened</span></>
                    )}
                  </div>
                  {testResult.outputs.length > 0 && (
                    <p className="mt-1 text-xs text-holio-muted">{testResult.outputs[0].text}</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-holio-text">Create Guardrail</h2>
              <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted hover:bg-gray-100 hover:text-holio-text">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 border-b border-gray-100 px-6">
              {CREATE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setCreateTab(t.key)}
                  className={cn(
                    'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                    createTab === t.key
                      ? 'border-holio-orange text-holio-orange'
                      : 'border-transparent text-holio-muted hover:text-holio-text',
                  )}
                >
                  {t.label}
                  {tabFilled[t.key] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              <p className="mb-4 flex items-start gap-2 rounded-lg bg-holio-lavender/10 px-3 py-2.5 text-xs leading-relaxed text-holio-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-holio-lavender" />
                {TAB_HELP[createTab]}
              </p>

              {createTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="My Guardrail" />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={cn(inputCls, 'resize-none')} placeholder="Optional description" />
                  </div>
                  <div>
                    <label className={labelCls}>Blocked Input Messaging</label>
                    <input value={form.blockedInputMessaging} onChange={(e) => setForm((f) => ({ ...f, blockedInputMessaging: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Blocked Outputs Messaging</label>
                    <input value={form.blockedOutputsMessaging} onChange={(e) => setForm((f) => ({ ...f, blockedOutputsMessaging: e.target.value }))} className={inputCls} />
                  </div>
                </div>
              )}

              {createTab === 'content' && (
                <div className="space-y-3">
                  {form.contentFilters.map((cf, i) => {
                    const meta = CONTENT_FILTERS.find((f) => f.type === cf.type)
                    return (
                      <div key={cf.type} className="rounded-xl bg-gray-50 px-4 py-3">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-holio-text">{meta?.label ?? cf.type}</span>
                          {meta?.desc && <p className="text-xs text-holio-muted">{meta.desc}</p>}
                        </div>
                        <div className="flex gap-6">
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] font-semibold uppercase text-holio-muted">Input</label>
                            <div className="flex rounded-lg border border-gray-200 bg-white">
                              {STRENGTHS.map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => {
                                      const filters = [...f.contentFilters]
                                      filters[i] = { ...filters[i], inputStrength: s.value }
                                      return { ...f, contentFilters: filters }
                                    })
                                  }}
                                  className={cn(
                                    'flex-1 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
                                    cf.inputStrength === s.value
                                      ? 'bg-holio-orange text-white'
                                      : 'text-holio-muted hover:text-holio-text',
                                  )}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] font-semibold uppercase text-holio-muted">Output</label>
                            <div className="flex rounded-lg border border-gray-200 bg-white">
                              {STRENGTHS.map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => {
                                      const filters = [...f.contentFilters]
                                      filters[i] = { ...filters[i], outputStrength: s.value }
                                      return { ...f, contentFilters: filters }
                                    })
                                  }}
                                  className={cn(
                                    'flex-1 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
                                    cf.outputStrength === s.value
                                      ? 'bg-holio-orange text-white'
                                      : 'text-holio-muted hover:text-holio-text',
                                  )}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {createTab === 'topics' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <div className="space-y-2">
                      <input value={topicName} onChange={(e) => setTopicName(e.target.value)} className={inputCls} placeholder="Topic name, e.g. &quot;Competitor pricing&quot;" />
                      <textarea value={topicDef} onChange={(e) => setTopicDef(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} placeholder="Describe what this topic covers so the AI can identify it accurately" />
                    </div>
                    <button onClick={addTopic} disabled={!topicName.trim() || !topicDef.trim()} className="mt-2 rounded-lg bg-holio-orange px-4 py-1.5 text-xs font-semibold text-white hover:bg-holio-orange/90 disabled:opacity-50">
                      Add topic
                    </button>
                  </div>
                  {form.deniedTopics.length === 0 && <p className="text-center text-sm text-holio-muted">No denied topics added yet.</p>}
                  {form.deniedTopics.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-holio-text">{t.name}</p>
                        <p className="text-xs text-holio-muted">{t.definition}</p>
                      </div>
                      <button onClick={() => setForm((f) => ({ ...f, deniedTopics: f.deniedTopics.filter((_, idx) => idx !== i) }))} className="text-holio-muted hover:text-red-500">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {createTab === 'words' && (
                <div>
                  <label className={labelCls}>Blocked Words</label>
                  <textarea
                    value={form.wordFilters}
                    onChange={(e) => setForm((f) => ({ ...f, wordFilters: e.target.value }))}
                    rows={3}
                    className={cn(inputCls, 'resize-none font-mono')}
                    placeholder="Type words separated by commas, e.g. badword, offensive, harmful"
                  />
                  {parsedWords.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-holio-muted">{parsedWords.length} word{parsedWords.length !== 1 ? 's' : ''} will be blocked:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedWords.map((w, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                          >
                            {w}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = parsedWords.filter((_, idx) => idx !== i).join(', ')
                                setForm((f) => ({ ...f, wordFilters: updated }))
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {createTab === 'pii' && (
                <div className="space-y-3">
                  {PII_TYPES.map((pii) => {
                    const entry = form.piiEntries.find((p) => p.type === pii.type)
                    return (
                      <div key={pii.type} className="rounded-xl bg-gray-50 px-4 py-3">
                        <label className="flex items-start gap-2">
                          <input type="checkbox" checked={!!entry} onChange={() => togglePii(pii.type)} className="mt-1 accent-holio-orange" />
                          <div>
                            <span className="text-sm font-medium text-holio-text">{pii.label}</span>
                            <p className="text-xs text-holio-muted">{pii.desc}</p>
                          </div>
                        </label>
                        {entry && (
                          <div className="mt-2 ml-6 flex gap-2">
                            {PII_ACTIONS.map((a) => (
                              <button
                                key={a.value}
                                type="button"
                                onClick={() => setPiiAction(pii.type, a.value)}
                                className={cn(
                                  'flex-1 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                                  entry.action === a.value
                                    ? 'border-holio-orange bg-holio-orange/5'
                                    : 'border-gray-200 bg-white hover:border-gray-300',
                                )}
                              >
                                <span className={cn('font-medium', entry.action === a.value ? 'text-holio-orange' : 'text-holio-text')}>{a.label}</span>
                                <p className="mt-0.5 text-holio-muted">{a.desc}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving || !form.name.trim()} className="flex-1 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white hover:bg-holio-orange/90 disabled:opacity-50">
                {saving ? 'Creating…' : 'Create Guardrail'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-holio-text">Delete &ldquo;{deleteTarget.name}&rdquo;?</h2>
            <p className="mt-2 text-sm text-holio-muted">
              This will permanently remove the guardrail from AWS Bedrock. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget.guardrailId)} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
