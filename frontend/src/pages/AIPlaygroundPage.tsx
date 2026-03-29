import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  Send,
  Trash2,
  Save,
  Settings2,
  Loader2,
  Bot,
  User,
  Info,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
} from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { cn } from '../lib/utils'
import { usePlaygroundStore } from '../stores/playgroundStore'
import { useBotStore } from '../stores/botStore'
import { useCompanyStore } from '../stores/companyStore'
import {
  CURATED_MODELS,
  SYSTEM_PROMPT_TEMPLATES,
  QUICK_START_SUGGESTIONS,
  TIER_CONFIG,
  getModelMeta,
  formatTokenCount,
  tokenToWordEstimate,
  groupModelsByProvider,
} from './playground-constants'

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info className="h-3 w-3 cursor-help text-gray-400" />
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1.5 w-52 -translate-x-1/2 rounded-lg bg-holio-dark px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-holio-dark" />
        </span>
      )}
    </span>
  )
}

export default function AIPlaygroundPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)

  const messages = usePlaygroundStore((s) => s.messages)
  const presets = usePlaygroundStore((s) => s.presets)
  const selectedModel = usePlaygroundStore((s) => s.selectedModel)
  const temperature = usePlaygroundStore((s) => s.temperature)
  const maxTokens = usePlaygroundStore((s) => s.maxTokens)
  const systemPrompt = usePlaygroundStore((s) => s.systemPrompt)
  const streaming = usePlaygroundStore((s) => s.streaming)
  const setSelectedModel = usePlaygroundStore((s) => s.setSelectedModel)
  const setTemperature = usePlaygroundStore((s) => s.setTemperature)
  const setMaxTokens = usePlaygroundStore((s) => s.setMaxTokens)
  const setSystemPrompt = usePlaygroundStore((s) => s.setSystemPrompt)
  const clearChat = usePlaygroundStore((s) => s.clearChat)
  const sendMessage = usePlaygroundStore((s) => s.sendMessage)
  const fetchPresets = usePlaygroundStore((s) => s.fetchPresets)
  const savePreset = usePlaygroundStore((s) => s.savePreset)
  const loadPreset = usePlaygroundStore((s) => s.loadPreset)

  const availableModels = useBotStore((s) => s.availableModels)
  const fetchModels = useBotStore((s) => s.fetchModels)

  const [input, setInput] = useState('')
  const [presetName, setPresetName] = useState('')
  const [showPresetInput, setShowPresetInput] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeCompany?.id) return
    fetchModels(activeCompany.id)
    fetchPresets(activeCompany.id)
  }, [activeCompany?.id, fetchModels, fetchPresets])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  if (!activeCompany) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Select a company to use the AI Playground.</p>
        </div>
      </div>
    )
  }

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || streaming) return
    setInput('')
    await sendMessage(activeCompany.id, trimmed)
  }

  const handleSavePreset = async () => {
    const name = presetName.trim()
    if (!name) return
    await savePreset(activeCompany.id, name)
    setPresetName('')
    setShowPresetInput(false)
  }

  const usingFallback = availableModels.length === 0
  const bedrockModels = availableModels.length > 0
    ? availableModels.map((m) => ({ id: m.modelId, label: m.modelName }))
    : []
  const nonBedrockCurated = CURATED_MODELS.filter((m) => {
    const mMeta = getModelMeta(m.id)
    return mMeta.provider === 'OpenAI' || mMeta.provider === 'Google'
  })
  const models = bedrockModels.length > 0
    ? [...bedrockModels, ...nonBedrockCurated]
    : CURATED_MODELS

  const grouped = groupModelsByProvider(models)
  const meta = getModelMeta(selectedModel)
  const tierCfg = TIER_CONFIG[meta.tier]

  useEffect(() => {
    if (maxTokens > meta.maxTokens) setMaxTokens(meta.maxTokens)
  }, [selectedModel, meta.maxTokens, maxTokens, setMaxTokens])

  const TOKEN_PRESETS = [
    { label: 'Short', value: 512 },
    { label: 'Medium', value: 2048 },
    { label: 'Long', value: Math.min(8192, meta.maxTokens) },
    { label: 'Max', value: meta.maxTokens },
  ]

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />
      <div className="flex min-h-0 flex-1">
        {/* ── Left Sidebar ── */}
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm font-bold text-holio-dark">
            <Settings2 className="h-4 w-4 text-holio-orange" />
            Configuration
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Model selector */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-holio-dark outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
              >
                {Object.entries(grouped).map(([provider, items]) => (
                  <optgroup key={provider} label={provider}>
                    {items.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-500">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', tierCfg.color)}>
                  {tierCfg.label}
                </span>
                <span>Max output: {formatTokenCount(meta.maxTokens)} tokens</span>
              </div>
              {usingFallback && (
                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-holio-lavender/20 px-2.5 py-2 text-xs text-gray-600">
                  <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-holio-lavender" />
                  <span>
                    Showing common models.{' '}
                    <a href="/settings/company" className="font-medium text-holio-orange hover:underline">
                      Configure Bedrock credentials
                    </a>{' '}
                    to see your enabled models.
                  </span>
                </div>
              )}
            </div>

            {/* System Prompt */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
                System Prompt
                <Tooltip text="Instructions that define the AI's behavior and personality for the entire conversation." />
              </label>
              <div className="mb-2 flex flex-wrap gap-1">
                {SYSTEM_PROMPT_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setSystemPrompt(t.prompt)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
                      systemPrompt === t.prompt
                        ? 'border-holio-orange bg-holio-orange/10 text-holio-orange'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs text-holio-dark outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                placeholder="You are a helpful assistant."
              />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              {showPresetInput ? (
                <div className="flex gap-2">
                  <input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    placeholder="Preset name"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-holio-lavender"
                    autoFocus
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="rounded-lg bg-holio-orange px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowPresetInput(false); setPresetName('') }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPresetInput(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-holio-dark transition-colors hover:bg-gray-50"
                >
                  <Save className="h-4 w-4" />
                  Save as Preset
                </button>
              )}
              {presets.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Load Preset</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const preset = presets.find((p) => p.id === e.target.value)
                      if (preset) loadPreset(preset)
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-holio-dark outline-none focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30"
                  >
                    <option value="" disabled>Select a preset…</option>
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="rounded-lg border border-gray-200">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-gray-500 transition-colors hover:bg-gray-50"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  Advanced Settings
                </span>
                {showAdvanced ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              {showAdvanced && (
                <div className="space-y-4 border-t border-gray-100 px-3 py-3">
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase text-gray-500">
                      <span className="flex items-center gap-1.5">
                        Temperature
                        <Tooltip text="Controls randomness. Lower = more focused and deterministic. Higher = more creative and varied." />
                      </span>
                      <span className="font-mono text-holio-dark">{temperature.toFixed(1)}</span>
                    </label>
                    <input
                      type="range" min={0} max={1} step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-holio-orange"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
                      Max Response Length
                      <Tooltip text="Maximum length of the AI response. 1 token ≈ ¾ of a word." />
                    </label>
                    <input
                      type="range" min={256} max={meta.maxTokens} step={256}
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-holio-orange"
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {TOKEN_PRESETS.map((tp) => (
                        <button
                          key={tp.label}
                          onClick={() => setMaxTokens(tp.value)}
                          className={cn(
                            'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors',
                            maxTokens === tp.value
                              ? 'border-holio-orange bg-holio-orange/10 text-holio-orange'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300',
                          )}
                        >
                          {tp.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatTokenCount(maxTokens)} tokens · {tokenToWordEstimate(maxTokens)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={clearChat}
              className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </button>
          </div>
        </aside>

        {/* ── Right Panel ── */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 && !streaming && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-holio-lavender/30">
                  <Bot className="h-7 w-7 text-holio-lavender" />
                </div>
                <div>
                  <h3 className="font-semibold text-holio-dark">AI Playground</h3>
                  <p className="mt-1 max-w-md text-sm text-gray-500">
                    Test and compare AI models. Choose a model, set your instructions, and start a conversation.
                  </p>
                </div>
                <div className="mt-2">
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Try asking</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_START_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:border-holio-orange hover:bg-holio-orange/5 hover:text-holio-orange"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    msg.role === 'user' ? 'bg-holio-orange' : 'bg-holio-dark',
                  )}>
                    {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                  </div>
                  <div className={msg.role === 'user' ? 'max-w-[75%]' : 'max-w-[75%]'}>
                    <div className={cn(
                      'rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user' ? 'bg-holio-orange text-white' : 'bg-white text-holio-dark shadow-sm',
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'assistant' && (msg.tokensUsed || msg.latencyMs) && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                        {msg.tokensUsed != null && msg.tokensUsed > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Zap className="h-3 w-3" />
                            {msg.tokensUsed.toLocaleString()} tokens
                          </span>
                        )}
                        {msg.tokensUsed != null && msg.tokensUsed > 0 && msg.latencyMs != null && (
                          <span>·</span>
                        )}
                        {msg.latencyMs != null && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {(msg.latencyMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {streaming && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-holio-dark">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-holio-orange" />
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-200 bg-white px-6 py-3">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={streaming}
                className="flex-1 rounded-xl border border-gray-200 bg-holio-offwhite px-4 py-2.5 text-sm text-holio-dark outline-none placeholder:text-gray-400 focus:border-holio-lavender focus:ring-2 focus:ring-holio-lavender/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-holio-orange text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
              >
                {streaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
