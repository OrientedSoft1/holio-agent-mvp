import { useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { BarChart3, Zap, Clock, DollarSign, Loader2, Bot, BotOff } from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { useUsageStore } from '../stores/usageStore'
import { useCompanyStore } from '../stores/companyStore'
import { cn } from '../lib/utils'

const PIE_COLORS = ['#FF9220', '#D1CBFB', '#C6D5BA', '#152022', '#6366f1', '#ec4899']

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`
}

export default function AIUsageDashboardPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const { summary, dailyUsage, byModel, byBot, loading, error, fetchAll } = useUsageStore()

  useEffect(() => {
    if (!activeCompany) return
    fetchAll(activeCompany.id)
  }, [activeCompany, fetchAll])

  if (!activeCompany) {
    return (
      <div className="flex h-full items-center justify-center bg-holio-offwhite">
        <p className="text-sm text-gray-500">Select a company to view usage analytics.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-holio-orange" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <BarChart3 className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-500">Failed to load usage data. Please try again.</p>
          <button
            onClick={() => fetchAll(activeCompany.id)}
            className="rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const hasNoBots = summary !== null && summary.activeBots === 0 && summary.totalTasks === 0
  const hasNoUsage =
    summary !== null &&
    summary.totalTokens === 0 &&
    summary.totalTasks === 0 &&
    dailyUsage.length === 0 &&
    byModel.length === 0 &&
    byBot.length === 0

  if (hasNoBots) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <BotOff className="h-7 w-7 text-gray-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">No active bots</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Create a bot for this company to start tracking AI usage. Once a bot processes tasks,
              analytics will appear here.
            </p>
          </div>
          <a
            href="/bots"
            className="rounded-lg bg-holio-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Go to Bots
          </a>
        </div>
      </div>
    )
  }

  if (hasNoUsage) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <BarChart3 className="h-7 w-7 text-holio-orange" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">No usage data yet</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Your bots are set up, but no tasks have been processed yet. Mention a bot in a chat
              conversation to trigger AI processing — usage metrics will appear here automatically.
            </p>
          </div>
          <button
            onClick={() => fetchAll(activeCompany.id)}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const budgetPercent = summary?.budgetLimit
    ? Math.min((summary.totalTokens / summary.budgetLimit) * 100, 100)
    : null

  const sortedBots = [...byBot].sort((a, b) => b.tokens - a.tokens)

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">AI Usage</h1>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Zap className="h-5 w-5 text-holio-orange" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Tokens</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatTokens(summary?.totalTokens ?? 0)}</p>
              {budgetPercent !== null && summary?.budgetLimit && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Budget</span>
                    <span>{budgetPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-holio-orange' : 'bg-green-500',
                      )}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    of {formatTokens(summary.budgetLimit)} limit
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-holio-lavender/20">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalTasks ?? 0}</p>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-green-600">{summary?.completedTasks ?? 0} completed</span>
                <span className="text-red-500">{summary?.failedTasks ?? 0} failed</span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(summary?.avgResponseMs ?? 0)}</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Estimated Cost</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCost(summary?.estimatedCost ?? 0)}</p>
            </div>
          </div>

          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Token Usage</h2>
            {dailyUsage.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">No daily usage data yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#8E8E93' }}
                      tickFormatter={(d: string) =>
                        new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#8E8E93' }} tickFormatter={formatTokens} />
                    <Tooltip
                      formatter={(value) => [formatTokens(value as number), 'Tokens']}
                      labelFormatter={(label) =>
                        new Date(String(label)).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="tokens"
                      stroke="#FF9220"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#FF9220' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Usage by Model</h2>
              {byModel.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No model usage data yet.</p>
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byModel}
                          dataKey="tokens"
                          nameKey="modelId"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                        >
                          {byModel.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatTokens(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {byModel.map((m, i) => (
                      <div key={m.modelId} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="flex-1 truncate text-gray-700">{m.modelId}</span>
                        <span className="font-medium text-gray-900">{formatTokens(m.tokens)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Usage by Bot</h2>
              {sortedBots.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No bot usage data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-400">
                        <th className="pb-3 pr-4">Bot Name</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 pr-4 text-right">Tokens</th>
                        <th className="pb-3 text-right">Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBots.map((b) => (
                        <tr key={b.botId} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{b.botName}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-holio-lavender/20 px-2 py-0.5 text-xs font-medium capitalize text-indigo-600">
                              {b.botType}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-gray-900">
                            {formatTokens(b.tokens)}
                          </td>
                          <td className="py-3 text-right text-gray-500">{b.tasks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
