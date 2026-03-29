import { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Search,
  Copy,
  Link,
  Shield,
  UserMinus,
  Ban,
  Save,
  Loader2,
  Crown,
  ShieldCheck,
  Check,
  Hash,
  Pencil,
  BarChart3,
  Users,
  Eye,
  Forward,
} from 'lucide-react'
import api from '../../services/api.service'
import { cn } from '../../lib/utils'
import type { ChatMember, ChannelPermissions, Chat, Message } from '../../types'

interface ChannelAdminPanelProps {
  chat: Chat
  onClose: () => void
}

const SLOW_MODE_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '15m', value: 900 },
  { label: '1h', value: 3600 },
]

const ROLE_ICON: Record<string, typeof Crown> = {
  owner: Crown,
  admin: ShieldCheck,
  member: Shield,
}

const ROLE_COLOR: Record<string, string> = {
  owner: 'text-holio-orange bg-holio-orange/10',
  admin: 'text-purple-600 bg-purple-50',
  member: 'text-gray-500 bg-gray-100',
}

export default function ChannelAdminPanel({ chat, onClose }: ChannelAdminPanelProps) {
  const [members, setMembers] = useState<ChatMember[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inviteLinks, setInviteLinks] = useState<Array<{ token: string; expiresAt: string }>>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [recentPosts, setRecentPosts] = useState<Message[]>([])

  const membersRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  const [name, setName] = useState(chat.name ?? '')
  const [description, setDescription] = useState(chat.description ?? '')
  const [isPublic, setIsPublic] = useState(chat.isPublic ?? false)
  const [slowMode, setSlowMode] = useState(chat.slowModeInterval ?? 0)

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/groups/${chat.id}/members?limit=100`)
      setMembers(data.data ?? data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [chat.id])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const { data } = await api.get<Message[]>(`/chats/${chat.id}/messages`, {
          params: { page: 1, limit: 3 },
        })
        setRecentPosts(data)
      } catch {
        // ignore
      }
    }
    fetchRecentPosts()
  }, [chat.id])

  useEffect(() => {
    api.get(`/groups/${chat.id}/invite-links`)
      .then(({ data }) => setInviteLinks(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [chat.id])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await api.patch(`/groups/${chat.id}`, {
        name: name || undefined,
        description: description || undefined,
        isPublic,
        slowModeInterval: slowMode,
      })
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePermission = async (
    member: ChatMember,
    key: keyof ChannelPermissions,
  ) => {
    const updated = { ...member.permissions, [key]: !member.permissions[key] }
    try {
      await api.post(`/groups/${chat.id}/permissions`, {
        userId: member.userId,
        permissions: updated,
      })
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, permissions: updated } : m,
        ),
      )
    } catch {
      // ignore
    }
  }

  const handleKick = async (userId: string) => {
    try {
      await api.delete(`/groups/${chat.id}/members/${userId}`)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
    } catch {
      // ignore
    }
  }

  const handleBan = async (userId: string) => {
    try {
      await api.post(`/groups/${chat.id}/ban/${userId}`)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
    } catch {
      // ignore
    }
  }

  const handleGenerateLink = async () => {
    try {
      const { data } = await api.post(`/groups/${chat.id}/invite-link`, {})
      setInviteLinks((prev) => [...prev, data])
    } catch {
      // ignore
    }
  }

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/join/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleAction = (label: string) => {
    switch (label) {
      case 'Edit':
        settingsRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'Members':
        membersRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'Statistics':
        break
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const fullName = `${m.user.firstName} ${m.user.lastName ?? ''}`.toLowerCase()
    return fullName.includes(q) || m.user.username?.toLowerCase().includes(q)
  })

  return (
    <div className="flex h-screen w-[340px] flex-shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <h3 className="text-sm font-semibold text-holio-text">Admin Panel</h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Channel Identity */}
        <div className="flex flex-col items-center border-b border-gray-100 px-4 py-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Hash className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="mt-2 text-sm font-semibold text-holio-text">{chat.name ?? 'Channel'}</h4>
          <p className="text-xs text-holio-muted">channel, {members.length} subscribers</p>
        </div>

        {/* Admin Banner */}
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-holio-orange/10 px-3 py-2.5">
          <Shield className="h-4 w-4 flex-shrink-0 text-holio-orange" />
          <span className="text-xs font-medium text-holio-orange">
            You are the admin of this channel
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 py-4">
          {(
            [
              [Pencil, 'Edit'],
              [BarChart3, 'Statistics'],
              [Users, 'Members'],
              [Link, 'Invite Link'],
            ] as const
          ).map(([Icon, label]) => (
            <button
              key={label}
              onClick={label === 'Invite Link' ? handleGenerateLink : () => handleAction(label)}
              title={label === 'Edit' ? 'Edit channel settings' : undefined}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-gray-50 py-3 text-holio-muted transition-colors hover:bg-holio-lavender/20 hover:text-holio-text"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="border-b border-gray-100 px-4 pb-4">
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-holio-muted uppercase">
              Recent Posts
            </h4>
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <div key={post.id} className="rounded-lg bg-gray-50 p-3">
                  <p className="line-clamp-2 text-xs text-holio-text">{post.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-holio-muted">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Forward className="h-3 w-3" />
                      {post.forwardCount ?? 0}
                    </span>
                    <span className="ml-auto">
                      {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Channel Settings */}
        <div ref={settingsRef} className="border-b border-gray-100 px-4 py-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wide text-holio-muted uppercase">
            Channel Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-holio-text">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-1 focus:ring-holio-lavender/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-holio-text">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender focus:ring-1 focus:ring-holio-lavender/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-holio-text">Public channel</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  'h-6 w-10 rounded-full p-0.5 transition-colors',
                  isPublic ? 'bg-holio-orange' : 'bg-gray-300',
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    isPublic ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-holio-text">
                Slow Mode
              </label>
              <select
                value={slowMode}
                onChange={(e) => setSlowMode(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-holio-text outline-none focus:border-holio-lavender"
              >
                {SLOW_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-holio-orange/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>

        {/* Invite Links */}
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold tracking-wide text-holio-muted uppercase">
              Invite Links
            </h4>
            <button
              onClick={handleGenerateLink}
              className="flex items-center gap-1 rounded-lg bg-holio-lavender/20 px-2.5 py-1 text-xs font-medium text-holio-text transition-colors hover:bg-holio-lavender/30"
            >
              <Link className="h-3 w-3" />
              Generate
            </button>
          </div>
          {inviteLinks.length === 0 ? (
            <p className="py-2 text-center text-xs text-holio-muted">
              No active invite links
            </p>
          ) : (
            <div className="space-y-2">
              {inviteLinks.map((link) => (
                <div
                  key={link.token}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-mono text-holio-text">
                      {link.token.slice(0, 16)}...
                    </p>
                    <p className="text-[10px] text-holio-muted">
                      Expires {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(link.token)}
                    className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-white hover:text-holio-text"
                  >
                    {copiedToken === link.token ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div ref={membersRef} className="px-4 py-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wide text-holio-muted uppercase">
            Members ({members.length})
          </h4>
          <div className="relative mb-3">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-holio-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-lg bg-gray-50 py-2 pr-3 pl-8 text-xs text-holio-text outline-none placeholder:text-holio-muted focus:ring-1 focus:ring-holio-lavender/50"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-holio-muted" />
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => {
                const RoleIcon = ROLE_ICON[member.role] ?? Shield
                const roleColor = ROLE_COLOR[member.role] ?? ROLE_COLOR.member
                const isOwner = member.role === 'owner'

                return (
                  <div
                    key={member.id}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      {member.user.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.firstName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-holio-lavender/30 text-xs font-semibold text-holio-text">
                          {member.user.firstName[0]}
                          {member.user.lastName?.[0] ?? ''}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-holio-text">
                            {member.user.firstName} {member.user.lastName ?? ''}
                          </span>
                          <span
                            className={cn(
                              'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize',
                              roleColor,
                            )}
                          >
                            <RoleIcon className="h-2.5 w-2.5" />
                            {member.role}
                          </span>
                        </div>
                      </div>
                      {!isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleKick(member.userId)}
                            className="rounded-full p-1 text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
                            title="Kick"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleBan(member.userId)}
                            className="rounded-full p-1 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                            title="Ban"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {!isOwner && (
                      <div className="mt-2 flex flex-wrap gap-1.5 pl-10">
                        {(
                          [
                            ['sendMessages', 'Send'],
                            ['sendMedia', 'Media'],
                            ['pinMessages', 'Pin'],
                            ['addMembers', 'Add'],
                          ] as const
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => handleTogglePermission(member, key)}
                            className={cn(
                              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                              member.permissions?.[key]
                                ? 'bg-holio-sage/30 text-green-700'
                                : 'bg-gray-100 text-gray-400',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
