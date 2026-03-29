import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plug, ChevronRight, Plus, X, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useIntegrationStore } from '../stores/integrationStore'
import { useCompanyStore } from '../stores/companyStore'

type Category = 'All' | 'AI & Models' | 'Automation' | 'Developer'

const CATEGORIES: Category[] = ['All', 'AI & Models', 'Automation', 'Developer']

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const integrations = useIntegrationStore((s) => s.integrations)
  const storeLoading = useIntegrationStore((s) => s.loading)
  const fetchIntegrations = useIntegrationStore((s) => s.fetchIntegrations)
  const toggleConnection = useIntegrationStore((s) => s.toggleConnection)
  const activeCompany = useCompanyStore((s) => s.activeCompany)

  useEffect(() => {
    if (activeCompany?.id) {
      fetchIntegrations(activeCompany.id)
    }
  }, [activeCompany?.id, fetchIntegrations])

  const filtered = useMemo(() => {
    let items = integrations
    if (activeCategory !== 'All') {
      items = items.filter((i) => i.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
      )
    }
    return items
  }, [integrations, activeCategory, searchQuery])

  return (
    <div className="flex min-h-full flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 bg-white px-4 shadow-sm">
        <button
          onClick={() => navigate('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {searchOpen ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations…"
              className="flex-1 bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery('')
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="flex-1 text-base font-bold text-holio-text">Integrations</h1>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Loading spinner */}
      {storeLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-holio-orange" />
        </div>
      )}

      {/* Scrollable content */}
      <div className={cn('flex-1 overflow-y-auto pb-24', storeLoading && 'hidden')}>
        {/* Hero */}
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-holio-lavender to-holio-orange p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Plug className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Your Tools</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/90">
                Extend Holio with AI models, automations, and developer tools to supercharge your
                workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-holio-orange text-white'
                  : 'bg-white text-holio-muted hover:bg-gray-100',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integration cards */}
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-holio-muted">
              <Search className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">No integrations found</p>
            </div>
          ) : (
            filtered.map((integration, idx) => (
              <div key={integration.id}>
                {idx > 0 && <div className="mx-4 border-t border-gray-100" />}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-holio-lavender/20 text-xl">
                    {integration.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-holio-text">{integration.name}</p>
                      <span className="flex items-center gap-1">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            integration.connected ? 'bg-green-500' : 'bg-gray-300',
                          )}
                        />
                        <span
                          className={cn(
                            'text-[11px]',
                            integration.connected ? 'text-green-600' : 'text-holio-muted',
                          )}
                        >
                          {integration.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-holio-muted">{integration.description}</p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleConnection(activeCompany!.id, integration.id)}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
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

                  {/* Settings chevron */}
                  {integration.configurable && (
                    <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-holio-orange shadow-lg transition-transform hover:scale-105 active:scale-95">
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  )
}
