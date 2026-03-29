import { useState, useEffect, type FormEvent } from 'react'
import {
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react'
import api from '../../services/api.service'
import { cn } from '../../lib/utils'
import type { OpenAIConfig } from '../../types'

interface Props {
  companyId: string
}

export default function OpenAISettings({ companyId }: Props) {
  const [config, setConfig] = useState<OpenAIConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [apiKey, setApiKey] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [defaultModelId, setDefaultModelId] = useState('')
  const [showKey, setShowKey] = useState(false)

  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    error?: string
  } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [companyId])

  async function loadConfig() {
    setLoading(true)
    try {
      const { data } = await api.get<OpenAIConfig>(
        `/companies/${companyId}/openai-config`,
      )
      setConfig(data)
      if (data.organizationId) setOrganizationId(data.organizationId)
      if (data.defaultModelId) setDefaultModelId(data.defaultModelId)
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
      const payload: Record<string, unknown> = {}
      if (apiKey) payload.apiKey = apiKey
      if (organizationId !== undefined) payload.organizationId = organizationId
      if (defaultModelId !== undefined) payload.defaultModelId = defaultModelId

      const { data } = await api.put<OpenAIConfig>(
        `/companies/${companyId}/openai-config`,
        payload,
      )
      setConfig(data)
      setApiKey('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handle silently
    } finally {
      setSaving(false)
    }
  }

  async function handleValidate() {
    if (!apiKey) return
    setValidating(true)
    setValidationResult(null)
    try {
      const { data } = await api.post<{ valid: boolean; error?: string }>(
        `/companies/${companyId}/openai-config/validate`,
        { apiKey },
      )
      setValidationResult(data)
    } catch {
      setValidationResult({ valid: false, error: 'Connection failed' })
    } finally {
      setValidating(false)
    }
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
          OpenAI Configuration
        </h3>
        <p className="text-sm text-holio-muted">
          Connect your OpenAI account to use GPT models in the AI Playground.
        </p>
      </div>

      {config?.isConfigured && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              OpenAI is configured
            </p>
            <p className="text-xs text-green-600">
              API key ending in{' '}
              <span className="font-mono">{config.apiKeyHint}</span>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Key */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">
              API Key
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    config?.isConfigured
                      ? `${config.apiKeyHint} (leave blank to keep)`
                      : 'sk-...'
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 pr-10 font-mono text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-holio-muted transition-colors hover:text-holio-text"
                >
                  {showKey ? (
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
              disabled={validating || !apiKey}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
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
                    Connection successful
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

        {/* Organization (optional) */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-holio-orange" />
            <h4 className="text-sm font-semibold text-holio-text">
              Organization
            </h4>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-holio-text">
              Organization ID
            </label>
            <input
              type="text"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="org-... (optional)"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 font-mono text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
            />
            <p className="mt-1.5 text-xs text-holio-muted">
              Optional. Only needed if your API key belongs to multiple organizations.
            </p>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving || (!apiKey && !config?.isConfigured)}
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
