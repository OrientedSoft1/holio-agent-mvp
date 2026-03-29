import { useState, useEffect } from 'react'
import {
  Workflow,
  Plus,
  Trash2,
  Play,
  Edit3,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Send,
  X,
  Bot,
} from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { cn } from '../lib/utils'
import { useAgentStore } from '../stores/agentStore'
import { useBotStore } from '../stores/botStore'
import { useCompanyStore } from '../stores/companyStore'
import type { AgentDefinition, AgentActionGroup } from '../types'

const WIZARD_STEPS = ['Basics', 'Action Groups', 'Knowledge Bases', 'Review'] as const

const STATUS_STYLES: Record<AgentDefinition['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  deploying: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<AgentDefinition['status'], string> = {
  draft: 'Draft',
  deploying: 'Activating',
  active: 'Live',
  failed: 'Error',
}

function friendlyModelName(raw: string): string {
  return raw
    .replace(/^(anthropic\.|amazon\.|meta\.|mistral\.|cohere\.|ai21\.)/, '')
    .replace(/[-_]v\d+:\d+$/, '')
    .replace(/[-_]\d{8}$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface WizardForm {
  name: string
  description: string
  modelId: string
  instruction: string
  actionGroups: AgentActionGroup[]
  knowledgeBaseIds: string
}

const EMPTY_FORM: WizardForm = {
  name: '',
  description: '',
  modelId: '',
  instruction: '',
  actionGroups: [],
  knowledgeBaseIds: '',
}

const EMPTY_ACTION_GROUP: AgentActionGroup = {
  name: '',
  description: '',
  lambdaArn: '',
  apiSchema: '',
}

interface TestMessage {
  role: 'user' | 'assistant'
  text: string
}

export default function AgentBuilderPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const { agents, loading, fetchAgents, createAgent, updateAgent, deleteAgent, deployAgent, invokeAgent } =
    useAgentStore()
  const { availableModels, fetchModels } = useBotStore()

  const [showWizard, setShowWizard] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null)
  const [wizardStep, setWizardStep] = useState(0)
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [testAgent, setTestAgent] = useState<AgentDefinition | null>(null)
  const [testInput, setTestInput] = useState('')
  const [testMessages, setTestMessages] = useState<TestMessage[]>([])
  const [testLoading, setTestLoading] = useState(false)
  const [testSessionId] = useState(() => crypto.randomUUID())

  const models =
    availableModels.length > 0
      ? availableModels.map((m) => ({ id: m.modelId, label: m.modelName }))
      : [{ id: 'anthropic.claude-3-sonnet', label: 'Claude 3 Sonnet' }]

  function modelLabel(modelId: string) {
    return models.find((m) => m.id === modelId)?.label ?? friendlyModelName(modelId)
  }

  useEffect(() => {
    if (!activeCompany?.id) return
    fetchAgents(activeCompany.id)
    fetchModels(activeCompany.id)
  }, [activeCompany?.id, fetchAgents, fetchModels])

  if (!activeCompany) {
    return (
      <div className="flex h-full items-center justify-center bg-holio-offwhite">
        <p className="text-holio-muted">Select a company to continue.</p>
      </div>
    )
  }

  function openCreate() {
    setEditingAgent(null)
    setForm({ ...EMPTY_FORM, modelId: models[0]?.id ?? '' })
    setWizardStep(0)
    setShowWizard(true)
  }

  function openEdit(agent: AgentDefinition) {
    setEditingAgent(agent)
    setForm({
      name: agent.name,
      description: agent.description ?? '',
      modelId: agent.modelId,
      instruction: agent.instruction,
      actionGroups: agent.actionGroups.length > 0 ? agent.actionGroups : [],
      knowledgeBaseIds: agent.knowledgeBaseIds.join(', '),
    })
    setWizardStep(0)
    setShowWizard(true)
  }

  function closeWizard() {
    setShowWizard(false)
    setEditingAgent(null)
  }

  function buildDto() {
    const kbIds = form.knowledgeBaseIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return {
      name: form.name,
      description: form.description || undefined,
      modelId: form.modelId,
      instruction: form.instruction,
      actionGroups: form.actionGroups.filter((g) => g.name.trim()),
      knowledgeBaseIds: kbIds.length > 0 ? kbIds : undefined,
    }
  }

  async function handleSaveDraft() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, buildDto())
      } else {
        await createAgent(activeCompany!.id, buildDto())
      }
      closeWizard()
    } catch {
      /* store handles */
    } finally {
      setSaving(false)
    }
  }

  async function handleDeploy(agentId?: string) {
    setSaving(true)
    try {
      if (!agentId && !editingAgent) {
        const created = await createAgent(activeCompany!.id, buildDto())
        await deployAgent(created.id)
      } else {
        if (editingAgent) await updateAgent(editingAgent.id, buildDto())
        await deployAgent(agentId ?? editingAgent!.id)
      }
      closeWizard()
    } catch {
      /* store handles */
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAgent(id)
    } catch {
      /* store handles */
    }
  }

  async function handleTestSend() {
    if (!testAgent || !testInput.trim()) return
    const input = testInput.trim()
    setTestInput('')
    setTestMessages((m) => [...m, { role: 'user', text: input }])
    setTestLoading(true)
    try {
      const response = await invokeAgent(testAgent.id, input, testSessionId)
      setTestMessages((m) => [...m, { role: 'assistant', text: response }])
    } catch {
      setTestMessages((m) => [...m, { role: 'assistant', text: 'Error invoking agent.' }])
    } finally {
      setTestLoading(false)
    }
  }

  function addActionGroup() {
    setForm((f) => ({ ...f, actionGroups: [...f.actionGroups, { ...EMPTY_ACTION_GROUP }] }))
  }

  function removeActionGroup(idx: number) {
    setForm((f) => ({ ...f, actionGroups: f.actionGroups.filter((_, i) => i !== idx) }))
  }

  function updateActionGroup(idx: number, patch: Partial<AgentActionGroup>) {
    setForm((f) => ({
      ...f,
      actionGroups: f.actionGroups.map((g, i) => (i === idx ? { ...g, ...patch } : g)),
    }))
  }

  const canNext =
    wizardStep === 0 ? form.name.trim() && form.modelId && form.instruction.trim() : true

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-holio-orange" />
          <h1 className="text-xl font-bold text-holio-text">Agent Builder</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-holio-orange" />
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-holio-lavender/20">
              <Workflow className="h-10 w-10 text-holio-lavender" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-holio-text">No agents yet</h3>
            <p className="mt-2 max-w-sm text-sm text-holio-muted">
              Build intelligent agents that automate tasks and answer questions using your company's knowledge.
            </p>
            <button
              onClick={openCreate}
              className="mt-5 rounded-lg bg-holio-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90"
            >
              Create Your First Agent
            </button>
          </div>
        )}

        {!loading && agents.length > 0 && (
          <div className="mx-auto max-w-4xl space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-dark">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-holio-text">{agent.name}</p>
                  {agent.description && (
                    <p className="truncate text-xs text-holio-muted">{agent.description}</p>
                  )}
                </div>
                <span className="hidden text-xs text-holio-muted sm:block">
                  {modelLabel(agent.modelId)}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    STATUS_STYLES[agent.status],
                  )}
                >
                  {STATUS_LABELS[agent.status]}
                </span>
                <div className="flex items-center gap-1">
                  {agent.status === 'draft' && (
                    <button
                      onClick={() => handleDeploy(agent.id)}
                      title="Activate"
                      className="rounded-full p-1.5 text-holio-muted transition-colors hover:bg-holio-orange/10 hover:text-holio-orange"
                    >
                      <Rocket className="h-4 w-4" />
                    </button>
                  )}
                  {agent.status === 'active' && (
                    <button
                      onClick={() => {
                        setTestAgent(agent)
                        setTestMessages([])
                        setTestInput('')
                      }}
                      title="Test"
                      className="rounded-full p-1.5 text-holio-muted transition-colors hover:bg-green-50 hover:text-green-600"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(agent)}
                    title="Edit"
                    className="rounded-full p-1.5 text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    title="Delete"
                    className="rounded-full p-1.5 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-holio-text">
                {editingAgent ? 'Edit Agent' : 'Create Agent'}
              </h2>
              <button
                onClick={closeWizard}
                className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 border-b border-gray-100 px-6 pt-2">
              {WIZARD_STEPS.map((label, idx) => (
                <button
                  key={label}
                  onClick={() => idx <= wizardStep && setWizardStep(idx)}
                  className={cn(
                    'border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                    idx === wizardStep
                      ? 'border-holio-orange text-holio-orange'
                      : idx < wizardStep
                        ? 'border-transparent text-holio-text cursor-pointer'
                        : 'border-transparent text-holio-muted',
                  )}
                >
                  {idx + 1}. {label}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] flex-1 overflow-y-auto px-6 py-5">
              {wizardStep === 0 && (
                <div className="space-y-4">
                  <p className="text-xs text-holio-muted">Define your agent's identity and core behavior.</p>
                  <Field label="Name">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={INPUT_CLASS}
                      placeholder="e.g. Customer Support Agent"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className={cn(INPUT_CLASS, 'resize-none')}
                      placeholder="What does this agent do?"
                    />
                  </Field>
                  <Field label="Model">
                    <select
                      value={form.modelId}
                      onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))}
                      className={INPUT_CLASS}
                    >
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Instruction">
                    <textarea
                      value={form.instruction}
                      onChange={(e) => setForm((f) => ({ ...f, instruction: e.target.value }))}
                      rows={5}
                      className={cn(INPUT_CLASS, 'resize-none font-mono')}
                      placeholder="You are a helpful agent that..."
                    />
                  </Field>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-holio-text">Action Groups</p>
                      <button
                        onClick={addActionGroup}
                        className="flex items-center gap-1 text-xs font-semibold text-holio-orange hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Group
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-holio-muted">
                      Action groups define the capabilities your agent has. Each group represents a set of related tasks.
                    </p>
                  </div>
                  {form.actionGroups.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
                      <p className="text-sm text-holio-muted">
                        No action groups yet. Add a group to give your agent the ability to perform tasks.
                      </p>
                    </div>
                  )}
                  {form.actionGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-holio-muted">
                          Group {idx + 1}
                        </span>
                        <button
                          onClick={() => removeActionGroup(idx)}
                          className="rounded-full p-1 text-holio-muted hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        value={group.name}
                        onChange={(e) => updateActionGroup(idx, { name: e.target.value })}
                        className={INPUT_CLASS}
                        placeholder="e.g. Order Management"
                      />
                      <input
                        value={group.description}
                        onChange={(e) => updateActionGroup(idx, { description: e.target.value })}
                        className={INPUT_CLASS}
                        placeholder="What can this group do?"
                      />
                      <input
                        value={group.lambdaArn ?? ''}
                        onChange={(e) => updateActionGroup(idx, { lambdaArn: e.target.value })}
                        className={INPUT_CLASS}
                        placeholder="Webhook URL (optional)"
                      />
                      <div>
                        <textarea
                          value={group.apiSchema ?? ''}
                          onChange={(e) => updateActionGroup(idx, { apiSchema: e.target.value })}
                          rows={3}
                          className={cn(INPUT_CLASS, 'resize-none font-mono')}
                          placeholder="API schema (optional)"
                        />
                        <p className="mt-1 text-xs text-holio-muted">
                          Define the API endpoints this action group can call.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-holio-muted">Connect your agent to your company's knowledge sources.</p>
                  <Field label="Knowledge Bases">
                    <textarea
                      value={form.knowledgeBaseIds}
                      onChange={(e) => setForm((f) => ({ ...f, knowledgeBaseIds: e.target.value }))}
                      rows={3}
                      className={cn(INPUT_CLASS, 'resize-none font-mono')}
                      placeholder="e.g. product-docs, support-articles"
                    />
                  </Field>
                  <p className="text-xs text-holio-muted">
                    Link knowledge bases so your agent can search your company's documents and data. Enter comma-separated names or IDs.
                  </p>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-holio-text">Review</h3>
                  <p className="text-xs text-holio-muted">Review your agent configuration before saving.</p>
                  <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                    <ReviewRow label="Name" value={form.name} />
                    <ReviewRow label="Description" value={form.description || '—'} />
                    <ReviewRow label="Model" value={modelLabel(form.modelId)} />
                    <ReviewRow label="Instruction" value={form.instruction} mono />
                    <ReviewRow
                      label="Action Groups"
                      value={
                        form.actionGroups.filter((g) => g.name.trim()).length > 0
                          ? form.actionGroups
                              .filter((g) => g.name.trim())
                              .map((g) => g.name)
                              .join(', ')
                          : '—'
                      }
                    />
                    <ReviewRow label="Knowledge Bases" value={form.knowledgeBaseIds || '—'} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => (wizardStep > 0 ? setWizardStep((s) => s - 1) : closeWizard())}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {wizardStep > 0 ? 'Back' : 'Cancel'}
              </button>
              <div className="flex gap-2">
                {wizardStep === 3 && (
                  <>
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving || !form.name.trim()}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button
                      onClick={() => handleDeploy()}
                      disabled={saving || !form.name.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
                    >
                      <Rocket className="h-4 w-4" />
                      {saving ? 'Activating…' : 'Activate'}
                    </button>
                  </>
                )}
                {wizardStep < 3 && (
                  <button
                    onClick={() => setWizardStep((s) => s + 1)}
                    disabled={!canNext}
                    className="flex items-center gap-1 rounded-lg bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {testAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex h-[70vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-600" />
                <h2 className="text-lg font-bold text-holio-text">Test: {testAgent.name}</h2>
              </div>
              <button
                onClick={() => setTestAgent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {testMessages.length === 0 && (
                <p className="text-center text-sm text-holio-muted">
                  Send a message to test the agent.
                </p>
              )}
              {testMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[85%] rounded-xl px-4 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'ml-auto bg-holio-orange text-white'
                      : 'bg-gray-100 text-holio-text',
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {testLoading && (
                <div className="flex items-center gap-2 text-sm text-holio-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleTestSend()
              }}
              className="flex items-center gap-2 border-t border-gray-100 px-4 py-3"
            >
              <input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                placeholder="Type a message…"
              />
              <button
                type="submit"
                disabled={testLoading || !testInput.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-holio-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-holio-muted">{label}</span>
      <p className={cn('mt-0.5 text-holio-text', mono && 'whitespace-pre-wrap font-mono text-xs')}>
        {value}
      </p>
    </div>
  )
}
