import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Users, Crown, Shield, Loader2, ArrowLeft, Check } from 'lucide-react'
import { useCompanyStore } from '../stores/companyStore'
import { useAuthStore } from '../stores/authStore'
import Sidebar from '../components/layout/Sidebar'
import BottomNavBar from '../components/layout/BottomNavBar'
import type { Company } from '../types'
import api from '../services/api.service'

interface CompanyWithMeta extends Company {
  memberCount?: number
  role?: string
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    owner: 'bg-holio-orange/10 text-holio-orange',
    admin: 'bg-holio-lavender text-holio-dark',
    member: 'bg-gray-100 text-gray-600',
    guest: 'bg-gray-100 text-gray-500 border border-gray-200',
  }

  const icons: Record<string, React.ReactNode> = {
    owner: <Crown className="h-3 w-3" />,
    admin: <Shield className="h-3 w-3" />,
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[role] || styles.member}`}
    >
      {icons[role]}
      {role}
    </span>
  )
}

function CompanyAvatar({
  company,
  size = 'md',
}: {
  company: Company
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-lg'

  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={company.name}
        className={`${dim} rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-holio-orange font-bold text-white`}
    >
      {company.name.charAt(0).toUpperCase()}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl p-4">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-3 w-20 rounded bg-gray-200" />
      </div>
      <div className="h-5 w-16 rounded-full bg-gray-200" />
    </div>
  )
}

export default function SelectCompanyPage() {
  const navigate = useNavigate()
  const { companies, loading, fetchCompanies, switchCompany, activeCompany } =
    useCompanyStore()
  const [companiesWithMeta, setCompaniesWithMeta] = useState<
    CompanyWithMeta[]
  >([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCompanies().then(async (fetched) => {
      const enriched: CompanyWithMeta[] = await Promise.all(
        fetched.map(async (c) => {
          try {
            const { data } = await api.get(`/companies/${c.id}/members`)
            const members = Array.isArray(data) ? data : []
            const currentUserId = useAuthStore.getState().user?.id
            const myMembership = members.find(
              (m: { userId: string }) => m.userId === currentUserId,
            )
            return {
              ...c,
              memberCount: members.length,
              role: myMembership?.role || 'member',
            }
          } catch {
            return { ...c, memberCount: 0, role: 'member' }
          }
        }),
      )
      setCompaniesWithMeta(enriched)
    })
  }, [fetchCompanies])

  function handleSelectCompany(company: CompanyWithMeta) {
    switchCompany(company)
    navigate('/chat')
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    setCreating(true)
    setError('')

    try {
      const { data } = await api.post<Company>('/companies', {
        name: newName.trim(),
      })
      const created = useCompanyStore.getState().createCompany
      void created
      switchCompany(data)
      navigate('/chat')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create workspace'
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  const displayCompanies =
    companiesWithMeta.length > 0
      ? companiesWithMeta
      : companies.map((c) => ({ ...c, memberCount: 0, role: 'member' }))

  const content = (
    <div className="flex min-h-screen items-center justify-center bg-holio-offwhite px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        {activeCompany && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <h1 className="mb-1 text-center text-3xl font-black tracking-tight text-holio-dark">
          HOLIO
        </h1>
        <p className="mb-2 text-center text-sm text-holio-muted">
          Corporate Messaging Platform
        </p>

        <h2 className="mb-6 text-center text-lg font-semibold text-holio-text">
          Select your workspace
        </h2>

        {loading && companies.length === 0 ? (
          <div className="space-y-2">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : displayCompanies.length === 0 ? (
          <div className="mb-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-holio-muted" />
            <p className="text-sm text-holio-muted">
              You&apos;re not a member of any workspace yet.
            </p>
            <p className="text-sm text-holio-muted">
              Create one to get started.
            </p>
          </div>
        ) : (
          <div className="mb-4 space-y-1">
            {displayCompanies.map((company) => {
              const isActive = activeCompany?.id === company.id
              return (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors ${
                    isActive
                      ? 'bg-holio-orange/5 ring-1 ring-holio-orange/30'
                      : 'hover:bg-holio-offwhite'
                  }`}
                >
                  <CompanyAvatar company={company} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-holio-text">
                      {company.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-holio-muted">
                      <Users className="h-3 w-3" />
                      <span>
                        {company.memberCount}{' '}
                        {company.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="h-5 w-5 shrink-0 text-holio-orange" />
                  )}
                  {company.role && <RoleBadge role={company.role} />}
                </button>
              )
            })}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-holio-offwhite"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-holio-muted">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-holio-text">
                  Create new workspace
                </p>
                <p className="text-xs text-holio-muted">
                  Start a new company workspace
                </p>
              </div>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <label className="block text-sm font-medium text-holio-text">
                Workspace name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Acme Corp"
                autoFocus
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewName('')
                    setError('')
                  }}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-holio-text transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )

  if (!activeCompany) {
    return content
  }

  return (
    <div className="flex h-screen bg-holio-offwhite">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-hidden pb-14 md:pb-0">
        {content}
      </main>
      <BottomNavBar />
    </div>
  )
}
