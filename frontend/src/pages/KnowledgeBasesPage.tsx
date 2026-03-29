import { useState, useEffect } from 'react'
import {
  Database,
  Search,
  RefreshCw,
  FileText,
  Loader2,
  X,
  Trash2,
  AlertTriangle,
  Plus,
  BookOpen,
  Zap,
  HelpCircle,
  FolderOpen,
} from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { cn } from '../lib/utils'
import { useKBStore } from '../stores/kbStore'
import { useCompanyStore } from '../stores/companyStore'
import type { KnowledgeBase, KBRetrievalResult, KBRagResult } from '../types'

const STATUS_STYLES: Record<
  KnowledgeBase['status'],
  { bg: string; text: string; label: string }
> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  CREATING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Creating' },
  UPDATING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Syncing' },
  DELETING: { bg: 'bg-red-100', text: 'text-red-700', label: 'Deleting' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function KnowledgeBasesPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const knowledgeBases = useKBStore((s) => s.knowledgeBases)
  const loading = useKBStore((s) => s.loading)
  const fetchKnowledgeBases = useKBStore((s) => s.fetchKnowledgeBases)
  const queryKB = useKBStore((s) => s.queryKB)
  const ragQuery = useKBStore((s) => s.ragQuery)
  const syncKB = useKBStore((s) => s.syncKB)
  const deleteKB = useKBStore((s) => s.deleteKB)
  const createKB = useKBStore((s) => s.createKB)

  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [drawerTab, setDrawerTab] = useState<'retrieve' | 'rag'>('retrieve')
  const [queryInput, setQueryInput] = useState('')
  const [querying, setQuerying] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [retrieveResults, setRetrieveResults] = useState<KBRetrievalResult[]>([])
  const [ragResult, setRagResult] = useState<KBRagResult | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    s3BucketName: '',
  })

  useEffect(() => {
    if (activeCompany?.id) fetchKnowledgeBases(activeCompany.id)
  }, [activeCompany?.id, fetchKnowledgeBases])

  useEffect(() => {
    if (syncSuccess) {
      const t = setTimeout(() => setSyncSuccess(null), 3000)
      return () => clearTimeout(t)
    }
  }, [syncSuccess])

  if (!activeCompany) {
    return (
      <div className="flex h-full flex-col bg-holio-offwhite">
        <AINavTabs />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Select a company to view knowledge bases.</p>
        </div>
      </div>
    )
  }

  const handleSync = async (kb: KnowledgeBase) => {
    setSyncing(kb.knowledgeBaseId)
    try {
      await syncKB(activeCompany.id, kb.knowledgeBaseId)
      setSyncSuccess(kb.knowledgeBaseId)
      await fetchKnowledgeBases(activeCompany.id)
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (kbId: string) => {
    setDeleting(true)
    try {
      await deleteKB(activeCompany.id, kbId)
      setDeleteConfirm(null)
      if (selectedKB?.knowledgeBaseId === kbId) closeDrawer()
    } finally {
      setDeleting(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.s3BucketName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await createKB(activeCompany.id, {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        s3BucketName: createForm.s3BucketName.trim(),
      })
      setShowCreateModal(false)
      setCreateForm({ name: '', description: '', s3BucketName: '' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to create knowledge base. Please check that your AWS credentials are configured and the S3 bucket exists.'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleQuery = async () => {
    if (!selectedKB || !queryInput.trim()) return
    setQuerying(true)
    try {
      if (drawerTab === 'retrieve') {
        const results = await queryKB(activeCompany.id, selectedKB.knowledgeBaseId, queryInput)
        setRetrieveResults(results)
        setRagResult(null)
      } else {
        const result = await ragQuery(activeCompany.id, selectedKB.knowledgeBaseId, queryInput)
        setRagResult(result)
        setRetrieveResults([])
      }
    } finally {
      setQuerying(false)
    }
  }

  const openDrawer = (kb: KnowledgeBase) => {
    setSelectedKB(kb)
    setDrawerTab('retrieve')
    setQueryInput('')
    setRetrieveResults([])
    setRagResult(null)
  }

  const closeDrawer = () => {
    setSelectedKB(null)
    setQueryInput('')
    setRetrieveResults([])
    setRagResult(null)
  }

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-holio-dark">Knowledge Bases</h1>
              <p className="mt-1 text-sm text-gray-500">
                Connect your AI to company documents and data via AWS Bedrock knowledge bases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchKnowledgeBases(activeCompany.id)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-holio-orange px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-holio-orange/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Create
              </button>
            </div>
          </div>

          {loading && knowledgeBases.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-holio-orange" />
            </div>
          ) : knowledgeBases.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-holio-lavender/20">
                <BookOpen className="h-8 w-8 text-holio-lavender" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-holio-dark">No knowledge bases yet</h3>
              <p className="mt-2 max-w-md text-center text-sm text-gray-500">
                Knowledge bases let your AI search and reference your company's documents,
                PDFs, and data sources for accurate, grounded answers.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 flex items-center gap-2 rounded-lg bg-holio-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-holio-orange/90"
              >
                <Plus className="h-4 w-4" />
                Create Knowledge Base
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {knowledgeBases.map((kb) => {
                const status = STATUS_STYLES[kb.status] ?? STATUS_STYLES.ACTIVE
                const isSyncing = syncing === kb.knowledgeBaseId
                const justSynced = syncSuccess === kb.knowledgeBaseId
                return (
                  <div
                    key={kb.knowledgeBaseId}
                    className="group flex flex-col rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-holio-lavender/20">
                        <Database className="h-5 w-5 text-holio-lavender" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', status.bg, status.text)}>
                          {status.label}
                        </span>
                        <button
                          onClick={() => setDeleteConfirm(kb.knowledgeBaseId)}
                          className="rounded-md p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-holio-dark">{kb.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-xs text-gray-500">
                      {kb.description || 'No description provided'}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                      <span title={new Date(kb.updatedAt).toLocaleString()}>
                        Updated {timeAgo(kb.updatedAt)}
                      </span>
                    </div>

                    {justSynced && (
                      <div className="mt-2 rounded-md bg-green-50 px-2.5 py-1.5 text-[11px] font-medium text-green-700">
                        Sync started successfully
                      </div>
                    )}

                    {deleteConfirm === kb.knowledgeBaseId && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Delete this knowledge base?
                        </div>
                        <p className="mt-1 text-[11px] text-red-600">This will also delete it from AWS Bedrock.</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleDelete(kb.knowledgeBaseId)}
                            disabled={deleting}
                            className="rounded-md bg-red-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleting ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-md border border-gray-200 px-3 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteConfirm !== kb.knowledgeBaseId && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleSync(kb)}
                          disabled={isSyncing}
                          className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-holio-dark transition-colors hover:bg-gray-50',
                            isSyncing && 'pointer-events-none opacity-50',
                          )}
                        >
                          <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
                          {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                        <button
                          onClick={() => openDrawer(kb)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-holio-orange px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-holio-orange/90"
                        >
                          <Search className="h-3.5 w-3.5" />
                          Query
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Query Drawer */}
      {selectedKB && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="relative flex w-full max-w-lg flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-holio-dark">{selectedKB.name}</h2>
                <p className="text-xs text-gray-500">Search and query this knowledge base</p>
              </div>
              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              {(['retrieve', 'rag'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setDrawerTab(tab); setRetrieveResults([]); setRagResult(null) }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors',
                    drawerTab === tab
                      ? 'border-holio-orange text-holio-orange'
                      : 'border-transparent text-gray-400 hover:text-gray-600',
                  )}
                >
                  {tab === 'retrieve' ? (
                    <><Search className="h-3.5 w-3.5" /> Retrieve</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5" /> RAG Query</>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 border-b border-gray-100 px-5 py-3">
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder={
                  drawerTab === 'retrieve'
                    ? 'e.g., What is our refund policy?'
                    : 'e.g., Summarize our Q4 sales data'
                }
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-dark outline-none placeholder:text-gray-400 focus:border-holio-orange focus:ring-1 focus:ring-holio-orange/30"
              />
              <button
                onClick={handleQuery}
                disabled={querying || !queryInput.trim()}
                className="flex items-center justify-center rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
              >
                {querying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {querying && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-holio-orange" />
                  <p className="mt-2 text-xs text-gray-400">Searching knowledge base...</p>
                </div>
              )}

              {!querying && drawerTab === 'retrieve' && retrieveResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500">
                    {retrieveResults.length} result{retrieveResults.length !== 1 ? 's' : ''} found
                  </p>
                  {retrieveResults.map((result, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-holio-dark">Result {idx + 1}</span>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          result.score >= 0.7 ? 'bg-green-100 text-green-700'
                            : result.score >= 0.4 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600',
                        )}>
                          {(result.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-700">{result.content}</p>
                      {result.sourceUri && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">{result.sourceUri}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!querying && drawerTab === 'rag' && ragResult && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-holio-lavender/10 p-4">
                    <p className="text-sm leading-relaxed text-holio-dark">{ragResult.answer}</p>
                  </div>
                  {ragResult.citations.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-holio-dark">
                        Sources ({ragResult.citations.reduce((n, c) => n + c.references.length, 0)})
                      </h4>
                      <div className="space-y-2">
                        {ragResult.citations.map((citation, cIdx) =>
                          citation.references.map((ref, rIdx) => (
                            <div key={`${cIdx}-${rIdx}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                              <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-holio-orange">
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{ref.sourceUri}</span>
                              </div>
                              <p className="text-xs leading-relaxed text-gray-500">{ref.content}</p>
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!querying && retrieveResults.length === 0 && !ragResult && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HelpCircle className="mb-3 h-10 w-10 text-gray-200" />
                  {drawerTab === 'retrieve' ? (
                    <>
                      <p className="text-sm font-medium text-gray-500">Search your documents</p>
                      <p className="mt-1 max-w-xs text-xs text-gray-400">
                        Enter a query to find relevant passages from your knowledge base. Results are ranked by relevance.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-500">Ask a question</p>
                      <p className="mt-1 max-w-xs text-xs text-gray-400">
                        Get an AI-generated answer grounded in your knowledge base documents, with source citations.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create KB Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => !creating && setShowCreateModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-holio-dark">Create Knowledge Base</h2>
              <button
                onClick={() => !creating && setShowCreateModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Give your knowledge base a name and point it to an S3 bucket containing your documents.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Company Policies"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-holio-orange focus:ring-1 focus:ring-holio-orange/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Description (optional)</label>
                <input
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g., HR policies, onboarding guides, product docs"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-holio-orange focus:ring-1 focus:ring-holio-orange/30"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <FolderOpen className="h-3 w-3" /> Document Storage (S3 Bucket)
                </label>
                <input
                  value={createForm.s3BucketName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, s3BucketName: e.target.value }))}
                  placeholder="e.g., my-company-docs"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-holio-orange focus:ring-1 focus:ring-holio-orange/30"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  The name of the S3 bucket that contains your documents (PDFs, text files, etc.)
                </p>
              </div>

              {createError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  {createError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.name.trim() || !createForm.s3BucketName.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white hover:bg-holio-orange/90 disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
