import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronRight, Activity, CheckCircle2, XCircle, Zap, Clock, Hash } from 'lucide-react'
import { cn } from '../lib/utils'
import api from '../services/api.service'
import type { Bot, BotTask } from '../types'

interface BotStats {
  total: number
  completed: number
  failed: number
  running: number
  queued: number
  avgDurationMs: number
  totalTokens: number
}

const STATUS_CONFIG: Record<BotTask['status'], { color: string; bg: string; label: string }> = {
  completed: { color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  failed: { color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
  running: { color: 'text-holio-orange', bg: 'bg-orange-100', label: 'Running' },
  queued: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Queued' },
}

function computeStats(tasks: BotTask[]): BotStats {
  const completed = tasks.filter((t) => t.status === 'completed')
  const failed = tasks.filter((t) => t.status === 'failed')
  const running = tasks.filter((t) => t.status === 'running')
  const queued = tasks.filter((t) => t.status === 'queued')

  const durationsMs = completed
    .map((t) => t.durationMs)
    .filter((d): d is number => d !== null)
  const avgDurationMs =
    durationsMs.length > 0
      ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length
      : 0

  const totalTokens = tasks.reduce((sum, t) => sum + (t.tokensUsed ?? 0), 0)

  return {
    total: tasks.length,
    completed: completed.length,
    failed: failed.length,
    running: running.length,
    queued: queued.length,
    avgDurationMs,
    totalTokens,
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TOKEN_BUDGET = 100_000

export default function BotAnalyticsPage() {
  const navigate = useNavigate()
  const { botId } = useParams<{ botId: string }>()

  const [bot, setBot] = useState<Bot | null>(null)
  const [tasks, setTasks] = useState<BotTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  useEffect(() => {
    if (!botId) return

    let cancelled = false

    const fetchData = async () => {
      try {
        const [botRes, tasksRes] = await Promise.all([
          api.get<Bot>(`/bots/${botId}`),
          api.get<BotTask[]>(`/bots/${botId}/tasks`, { params: { limit: 50 } }),
        ])
        if (!cancelled) {
          setBot(botRes.data)
          setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : [])
          setError(null)
        }
      } catch {
        if (!cancelled) setError('Failed to load bot analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [botId])

  const stats = useMemo(() => computeStats(tasks), [tasks])
  const tokenPercent = Math.min((stats.totalTokens / TOKEN_BUDGET) * 100, 100)

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-holio-offwhite">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/bots')}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-holio-text" />
          </button>
          <h1 className="text-lg font-semibold text-holio-text">Bot Analytics</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !bot) {
    return (
      <div className="flex h-screen flex-col bg-holio-offwhite">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/bots')}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-holio-text" />
          </button>
          <h1 className="text-lg font-semibold text-holio-text">Bot Analytics</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-holio-muted">
          <XCircle className="h-10 w-10 opacity-40" />
          <p className="text-sm">{error ?? 'Bot not found'}</p>
          <button
            onClick={() => navigate('/bots')}
            className="mt-2 rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Back to Bots
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => navigate('/bots')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-holio-text">{bot.name}</h1>
          <p className="truncate text-xs text-holio-muted">Analytics &amp; Task History</p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize',
            bot.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500',
          )}
        >
          {bot.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Stats Summary */}
        <SectionLabel>Overview</SectionLabel>
        <div className="mx-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Hash}
            label="Total Tasks"
            value={stats.total.toString()}
            iconBg="bg-holio-lavender/30"
            iconColor="text-holio-lavender"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed.toString()}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats.failed.toString()}
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />
          <StatCard
            icon={Clock}
            label="Avg. Response"
            value={formatDuration(stats.avgDurationMs)}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* Token Usage */}
        <SectionLabel>Token Usage</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white p-4 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-holio-orange" />
              <span className="text-sm font-medium text-holio-text">
                {stats.totalTokens.toLocaleString()} tokens used
              </span>
            </div>
            <span className="text-xs text-holio-muted">
              of {TOKEN_BUDGET.toLocaleString()} budget
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                tokenPercent > 90
                  ? 'bg-red-500'
                  : tokenPercent > 70
                    ? 'bg-holio-orange'
                    : 'bg-holio-sage',
              )}
              style={{ width: `${tokenPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-holio-muted">
            {tokenPercent.toFixed(1)}% used
          </p>
        </div>

        {/* Running / Queued */}
        {(stats.running > 0 || stats.queued > 0) && (
          <>
            <SectionLabel>In Progress</SectionLabel>
            <div className="mx-4 flex gap-3">
              {stats.running > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-holio-orange" />
                  <span className="text-xs font-medium text-holio-orange">
                    {stats.running} running
                  </span>
                </div>
              )}
              {stats.queued > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-xs font-medium text-gray-500">
                    {stats.queued} queued
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recent Tasks */}
        <SectionLabel>Recent Tasks</SectionLabel>
        {tasks.length === 0 ? (
          <div className="mx-4 flex flex-col items-center rounded-2xl bg-white py-10 dark:bg-gray-900">
            <Activity className="mb-2 h-8 w-8 text-holio-muted opacity-30" />
            <p className="text-sm text-holio-muted">No tasks yet</p>
          </div>
        ) : (
          <div className="mx-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
            {tasks.map((task, idx) => {
              const cfg = STATUS_CONFIG[task.status]
              const isExpanded = expandedTask === task.id

              return (
                <div key={task.id}>
                  {idx > 0 && (
                    <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
                  )}
                  <button
                    onClick={() =>
                      setExpandedTask(isExpanded ? null : task.id)
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                        cfg.bg,
                        cfg.color,
                      )}
                    >
                      {cfg.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-holio-text">
                      {task.input
                        ? task.input.length > 60
                          ? task.input.slice(0, 60) + '…'
                          : task.input
                        : 'No input'}
                    </span>
                    <span className="flex-shrink-0 text-xs text-holio-muted">
                      {formatDate(task.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-holio-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-holio-muted" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <DetailBadge label="Status" value={cfg.label} />
                        <DetailBadge
                          label="Tokens"
                          value={
                            task.tokensUsed !== null
                              ? task.tokensUsed.toLocaleString()
                              : '—'
                          }
                        />
                        <DetailBadge
                          label="Duration"
                          value={
                            task.durationMs !== null
                              ? formatDuration(task.durationMs)
                              : '—'
                          }
                        />
                        <DetailBadge
                          label="Created"
                          value={formatDate(task.createdAt)}
                        />
                      </div>

                      {task.input && (
                        <div className="mb-2">
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
                            Input
                          </p>
                          <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-holio-text dark:bg-gray-900">
                            {task.input}
                          </pre>
                        </div>
                      )}

                      {task.output && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-holio-muted">
                            Output
                          </p>
                          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-holio-text dark:bg-gray-900">
                            {task.output}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-gray-900">
      <div className={cn('mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <p className="text-xl font-bold text-holio-text">{value}</p>
      <p className="text-xs text-holio-muted">{label}</p>
    </div>
  )
}

function DetailBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-2.5 py-1.5 dark:bg-gray-900">
      <p className="text-[10px] uppercase tracking-wider text-holio-muted">{label}</p>
      <p className="text-sm font-medium text-holio-text">{value}</p>
    </div>
  )
}
