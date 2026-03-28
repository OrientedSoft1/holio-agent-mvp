import { useState, useEffect, type FormEvent } from 'react'
import {
  Cloud,
  Key,
  Globe,
  Shield,
  Cpu,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Coins,
} from 'lucide-react'
import api from '../../services/api.service'
import { cn } from '../../lib/utils'
import type { BedrockConfig, BedrockModel } from '../../types'

const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-2', label: 'Europe (London)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
]

interface Props {
  companyId: string
}

export default function BedrockSettings({ companyId }: Props) {
  const [config, setConfig] = useState<BedrockConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretAccessKey, setSecretAccessKey] = useState('')
  const [region, setRegion] = useState('eu-west-1')
  const [guardrailId, setGuardrailId] = useState('')
  const [guardrailVersion, setGuardrailVersion] = useState('')
  const [defaultModelId, setDefaultModelId] = useState('')
  const [maxTokensBudget, setMaxTokensBudget] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    modelCount?: number
    error?: string
  } | null>(null)

  const [models, setModels] = useState<BedrockModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [allowedModels, setAllowedModels] = useState<string[]>([])

  useEffect(() => {
    loadConfig()
  }, [companyId])

  async function loadConfig() {
    setLoading(true)
    try {
      const { data } = await api.get<BedrockConfig>(
        `/companies/${companyId}/bedrock-config`,
      )
      setConfig(data)
      if (data.accessKeyId) setAccessKeyId(data.accessKeyId)
      if (data.region) setRegion(data.region)
      if (data.guardrailId) setGuardrailId(data.guardrailId)
      if (data.guardrailVersion) setGuardrailVersion(data.guardrailVersion)
      if (data.defaultModelId) setDefaultModelId(data.defaultModelId)
      if (data.maxTokensBudget) setMaxTokensBudget(String(data.maxTokensBudget))
      if (data.allowedModels) setAllowedModels(data.allowedModels)
    } catch {
      // Not configured yet
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { region }
      if (accessKeyId) payload.accessKeyId = accessKeyId
      if (secretAccessKey) payload.secretAccessKey = secretAccessKey
      if (guardrailId) payload.guardrailId = guardrailId
      if (guardrailVersion) payload.guardrailVersion = guardrailVersion
      if (defaultModelId) payload.defaultModelId = defaultModelId
      if (maxTokensBudget)
        payload.maxTokensBudget = parseInt(maxTokensBudget, 10)
      if (allowedModels.length > 0) payload.allowedModels = allowedModels

      const { data } = await api.put<BedrockConfig>(
        `/companies/${companyId}/bedrock-config`,
        payload,
      )
      setConfig(data)
      setSecretAccessKey('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handle silently
    } finally {
      setSaving(false)
    }
  }

  async function handleValidate() {
    if (!accessKeyId) return
    setValidating(true)
    setValidationResult(null)
    try {
      const { data } = await api.post<{
        valid: boolean
        modelCount?: number
        error?: string
      }>(`/companies/${companyId}/bedrock-config/validate`, {
        accessKeyId,
        secretAccessKey: secretAccessKey || undefined,
        region,
      })
      setValidationResult(data)
    } catch {
      setValidationResult({ valid: false, error: 'Connection failed' })
    } finally {
      setValidating(false)
    }
  }

  async function handleLoadModels() {
    setLoadingModels(true)
    try {
      const { data } = await api.get<BedrockModel[]>(
        `/companies/${companyId}/bedrock-models`,
      )
      setModels(data)
    } catch {
      // handle silently
    } finally {
      setLoadingModels(false)
    }
  }

  function toggleModelAllowed(modelId: string) {
    setAllowedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId],
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-holio-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-lg font-semibold text-holio-text">
          AI Configuration
        </h3>
        <p className="text-sm text-holio-muted">
          Connect your AWS Bedrock account to enable AI agents in this workspace.
        </p>
      </div>

      {config?.isConfigured && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Bedrock is configured
            </p>
            <p className="text-xs text-green-600">
              Credentials ending in{' '}
              <span className="font-mono">
                {config.secretAccessKeyHint}
              </span>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AWS Credentials */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">
              AWS Credentials
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Access Key ID
              </label>
              <input
                type="text"
                value={accessKeyId}
                onChange={(e) => setAccessKeyId(e.target.value)}
                placeholder="AKIA..."
                className="h-11 w-full rounded-xl border border-gray-200 px-4 font-mono text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Secret Access Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  placeholder={
                    config?.isConfigured
                      ? `${config.secretAccessKeyHint} (leave blank to keep)`
                      : 'Enter secret access key'
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 pr-10 font-mono text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-holio-muted transition-colors hover:text-holio-text"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !accessKeyId}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              Test connection
            </button>

            {validationResult && (
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                  validationResult.valid
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600',
                )}
              >
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Connection successful ({validationResult.modelCount} models
                    available)
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {validationResult.error}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Region */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">Region</h4>
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
          >
            {AWS_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} ({r.value})
              </option>
            ))}
          </select>
        </div>

        {/* Models */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-holio-orange" />
              <h4 className="text-sm font-semibold text-holio-text">
                Allowed Models
              </h4>
            </div>
            <button
              type="button"
              onClick={handleLoadModels}
              disabled={loadingModels || !config?.isConfigured}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-holio-text transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingModels ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Load models
            </button>
          </div>

          {!config?.isConfigured && (
            <p className="text-sm text-holio-muted">
              Save credentials first to load available models.
            </p>
          )}

          {models.length > 0 && (
            <>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-holio-text">
                  Default Model
                </label>
                <select
                  value={defaultModelId}
                  onChange={(e) => setDefaultModelId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
                >
                  <option value="">Select a default model</option>
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.provider} - {m.modelName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-2">
                {models.map((model) => (
                  <label
                    key={model.modelId}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50',
                      allowedModels.includes(model.modelId) &&
                        'bg-holio-lavender/20',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModels.includes(model.modelId)}
                      onChange={() => toggleModelAllowed(model.modelId)}
                      className="h-4 w-4 rounded border-gray-300 text-holio-orange focus:ring-holio-orange"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-holio-text">
                        {model.modelName}
                      </p>
                      <p className="text-xs text-holio-muted">
                        {model.provider} &middot;{' '}
                        <span className="font-mono">{model.modelId}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {allowedModels.length === 0 && (
                <p className="mt-2 text-xs text-holio-muted">
                  No models selected. All models will be available.
                </p>
              )}
            </>
          )}
        </div>

        {/* Guardrails */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">
              Guardrails
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Guardrail ID
              </label>
              <input
                type="text"
                value={guardrailId}
                onChange={(e) => setGuardrailId(e.target.value)}
                placeholder="Optional"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Guardrail Version
              </label>
              <input
                type="text"
                value={guardrailVersion}
                onChange={(e) => setGuardrailVersion(e.target.value)}
                placeholder="DRAFT"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-holio-muted">
            Guardrails filter harmful content and enforce content policies.
            Configure them in the AWS Bedrock console.
          </p>
        </div>

        {/* Budget */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Coins className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">
              Token Budget
            </h4>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-holio-text">
              Monthly token limit
            </label>
            <input
              type="number"
              value={maxTokensBudget}
              onChange={(e) => setMaxTokensBudget(e.target.value)}
              placeholder="No limit"
              min="0"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
            />
            <p className="mt-1.5 text-xs text-holio-muted">
              Maximum number of tokens across all AI agents per month. Leave
              empty for no limit.
            </p>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving || !accessKeyId}
          className="inline-flex items-center gap-2 rounded-xl bg-holio-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            'Saved!'
          ) : (
            'Save configuration'
          )}
        </button>
      </form>
    </div>
  )
}
