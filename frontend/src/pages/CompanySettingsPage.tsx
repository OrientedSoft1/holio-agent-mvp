import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react'
import {
  Building2,
  Users,
  Mail,
  Shield,
  Crown,
  UserPlus,
  Trash2,
  Settings,
  ChevronRight,
  Search,
  X,
  Loader2,
  Upload,
  User,
  Cpu,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useCompanyStore } from '../stores/companyStore'
import api from '../services/api.service'
import { cn } from '../lib/utils'
import BedrockSettings from '../components/company/BedrockSettings'
import OpenAISettings from '../components/company/OpenAISettings'
import GeminiSettings from '../components/company/GeminiSettings'
import type { Company, CompanyMember, CompanyInvitation } from '../types'

type Tab = 'general' | 'members' | 'invitations' | 'bedrock' | 'openai' | 'gemini'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
  { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
  {
    id: 'invitations',
    label: 'Invitations',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: 'bedrock',
    label: 'AWS Bedrock',
    icon: <Cpu className="h-4 w-4" />,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    icon: <Cpu className="h-4 w-4" />,
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    icon: <Cpu className="h-4 w-4" />,
  },
]

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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[role] || styles.member}`}
    >
      {icons[role]}
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    accepted: 'bg-green-50 text-green-700 border border-green-200',
    expired: 'bg-gray-100 text-gray-500 border border-gray-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  )
}

function GeneralTab({ company }: { company: Company }) {
  const [name, setName] = useState(company.name)
  const [description, setDescription] = useState(company.description || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const { setActiveCompany } = useCompanyStore()

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch<Company>(`/companies/${company.id}`, {
        name: name.trim(),
        description: description.trim() || null,
      })
      setActiveCompany(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handle silently
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-holio-text">
          Workspace Profile
        </h3>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-6">
            <div className="relative">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-holio-orange text-2xl font-bold text-white">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-holio-muted transition-colors hover:bg-gray-200"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadError('')
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    const { data } = await api.post<{ url: string }>('/uploads/company-logo', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    })
                    await api.patch(`/companies/${company.id}`, { logoUrl: data.url })
                    setActiveCompany({ ...company, logoUrl: data.url })
                  } catch {
                    setUploadError('Failed to upload logo')
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-holio-text">
                Workspace Logo
              </p>
              <p className="text-xs text-holio-muted">
                PNG, JPG up to 2MB. Displayed as a circle.
              </p>
              {uploadError && (
                <p className="mt-1 text-xs text-red-500">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Workspace name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this workspace about?"
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-holio-text">
                Slug
              </label>
              <input
                type="text"
                value={company.slug}
                readOnly
                className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-holio-muted"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-holio-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          'Saved!'
        ) : (
          'Save changes'
        )}
      </button>
    </form>
  )
}

function MembersTab({ companyId }: { companyId: string }) {
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ data: CompanyMember[]; total: number }>(
        `/companies/${companyId}/members`,
      )
      const raw = Array.isArray(data) ? data : data.data ?? []
      setMembers(raw.filter((m: CompanyMember) => m.user != null))
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  async function handleRoleChange(userId: string, role: string) {
    try {
      await api.patch(`/companies/${companyId}/members/${userId}`, { role })
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? { ...m, role: role as CompanyMember['role'] }
            : m,
        ),
      )
    } catch {
      // handle silently
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member from the workspace?')) return
    try {
      await api.delete(`/companies/${companyId}/members/${userId}`)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
    } catch {
      // handle silently
    }
  }

  const filtered = members.filter((m) => {
    if (!m.user) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.user.firstName?.toLowerCase().includes(q) ||
      m.user.lastName?.toLowerCase().includes(q) ||
      m.user.phone?.includes(q)
    )
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-holio-text">
          Members ({members.length})
        </h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-holio-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
          />
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-holio-muted">
            {search ? 'No members match your search' : 'No members found'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
              >
                {member.user?.avatarUrl ? (
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.firstName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-lavender text-sm font-semibold text-holio-dark">
                    {member.user?.firstName?.charAt(0) ?? '?'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-holio-text">
                    {member.user?.firstName ?? 'Unknown'} {member.user?.lastName || ''}
                  </p>
                  <p className="text-xs text-holio-muted">
                    {member.user?.phone ?? ''}
                  </p>
                </div>

                <RoleBadge role={member.role} />

                {member.role !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-holio-text focus:outline-none focus:ring-2 focus:ring-holio-orange"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.userId)}
                      className="rounded-lg p-1.5 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteModal
          companyId={companyId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => loadMembers()}
        />
      )}
    </div>
  )
}

function InviteModal({
  companyId,
  onClose,
  onInvited,
}: {
  companyId: string
  onClose: () => void
  onInvited: () => void
}) {
  const [contact, setContact] = useState('')
  const [role, setRole] = useState<'admin' | 'member' | 'guest'>('member')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!contact.trim()) return

    setSending(true)
    setError('')

    const isEmail = contact.includes('@')

    try {
      await api.post(`/companies/${companyId}/invite`, {
        [isEmail ? 'email' : 'phone']: contact.trim(),
        role,
      })
      onInvited()
      onClose()
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send invitation'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-holio-text">
            Invite member
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-holio-muted transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-holio-text">
              Phone or email
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="phone number or email address"
              autoFocus
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-holio-text">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'admin' | 'member' | 'guest')
              }
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-holio-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-holio-text transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !contact.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-holio-orange py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InvitationsTab({ companyId }: { companyId: string }) {
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const loadInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<CompanyInvitation[]>(
        `/companies/${companyId}/invitations`,
      )
      setInvitations(data)
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])

  async function handleCancel(invitationId: string) {
    try {
      await api.delete(`/companies/${companyId}/invitations/${invitationId}`)
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId))
    } catch {
      // handle silently
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-holio-text">Invitations</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-holio-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto mb-3 h-8 w-8 text-holio-muted" />
            <p className="text-sm text-holio-muted">No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-holio-muted">
                  <User className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-holio-text">
                    {invitation.email || invitation.phone}
                  </p>
                  <p className="text-xs text-holio-muted">
                    Expires {formatDate(invitation.expiresAt)}
                  </p>
                </div>

                <RoleBadge role={invitation.role} />
                <StatusBadge status={invitation.status} />

                {invitation.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(invitation.id)}
                    className="rounded-lg p-1.5 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteModal
          companyId={companyId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => loadInvitations()}
        />
      )}
    </div>
  )
}

export default function CompanySettingsPage() {
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'general'
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'general',
  )
  const { activeCompany } = useCompanyStore()

  if (!activeCompany) {
    return (
      <div className="flex h-full items-center justify-center bg-holio-offwhite">
        <div className="text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-holio-muted" />
          <p className="text-holio-muted">No workspace selected</p>
          <a
            href="/select-company"
            className="mt-2 inline-block text-sm font-medium text-holio-orange hover:underline"
          >
            Select a workspace
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-holio-offwhite">
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <h1 className="text-lg font-bold text-holio-text">HOLIO</h1>
        </div>

        <div className="px-3 py-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            {activeCompany.logoUrl ? (
              <img
                src={activeCompany.logoUrl}
                alt={activeCompany.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-holio-orange text-sm font-bold text-white">
                {activeCompany.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-holio-text">
                {activeCompany.name}
              </p>
              <p className="text-xs text-holio-muted">Workspace settings</p>
            </div>
          </div>

          <nav className="space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-holio-lavender/40 text-holio-text'
                    : 'text-holio-muted hover:bg-gray-50 hover:text-holio-text',
                )}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="ml-auto h-4 w-4 text-holio-muted" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-gray-100 px-5 py-4">
          <a
            href="/chat"
            className="text-sm font-medium text-holio-orange hover:underline"
          >
            &larr; Back to chat
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          {activeTab === 'general' && (
            <GeneralTab company={activeCompany} />
          )}
          {activeTab === 'members' && (
            <MembersTab companyId={activeCompany.id} />
          )}
          {activeTab === 'invitations' && (
            <InvitationsTab companyId={activeCompany.id} />
          )}
          {activeTab === 'bedrock' && (
            <BedrockSettings companyId={activeCompany.id} />
          )}
          {activeTab === 'openai' && (
            <OpenAISettings companyId={activeCompany.id} />
          )}
          {activeTab === 'gemini' && (
            <GeminiSettings companyId={activeCompany.id} />
          )}
        </div>
      </main>
    </div>
  )
}
