import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Bell,
  BellOff,
  Image,
  Link,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Bot,
  Plus,
  Settings,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
  Shield,
  Music,
  Mic,
  ImageIcon,
  Phone,
  AtSign,
  Share2,
  BookOpen,
  AlertTriangle,
  Video,
  FileText,
} from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useChatStore } from '../../stores/chatStore'
import { useBotStore } from '../../stores/botStore'
import { useAuthStore } from '../../stores/authStore'
import { useContactsStore } from '../../stores/contactsStore'
import { cn } from '../../lib/utils'
import ChannelAdminPanel from '../groups/ChannelAdminPanel'
import api from '../../services/api.service'
import type { Bot as BotType, User } from '../../types'

type MediaTab = 'photos' | 'videos' | 'files' | 'music' | 'voice' | 'links' | 'gifs'

const MEDIA_TABS: { id: MediaTab; label: string; icon: typeof Image; apiType: string }[] = [
  { id: 'photos', label: 'Photos', icon: ImageIcon, apiType: 'photo' },
  { id: 'videos', label: 'Videos', icon: Video, apiType: 'video' },
  { id: 'files', label: 'Files', icon: FileText, apiType: 'file' },
  { id: 'music', label: 'Music', icon: Music, apiType: 'music' },
  { id: 'voice', label: 'Voice', icon: Mic, apiType: 'voice' },
  { id: 'links', label: 'Links', icon: Link, apiType: 'link' },
  { id: 'gifs', label: 'GIFs', icon: Image, apiType: 'gif' },
]

const ACTIONS = [
  { label: 'Share this contact', icon: Share2, variant: 'default' as const },
  { label: 'Edit contact', icon: Pencil, variant: 'default' as const },
  { label: 'Delete contact', icon: Trash2, variant: 'danger' as const },
  { label: 'Add to group', icon: UserPlus, variant: 'default' as const },
  { label: 'Mention to Story', icon: BookOpen, variant: 'default' as const },
  { label: 'Block user', icon: AlertTriangle, variant: 'danger' as const },
]

const BOT_TYPE_ICON: Record<string, typeof Bot> = {
  cfo: DollarSign,
  marketing: Megaphone,
  hr: Users,
  support: Headphones,
  devops: Server,
  custom: Bot,
}

const BOT_TYPE_COLOR: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  custom: 'bg-holio-dark',
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mb`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Gb`
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function InfoPanel() {
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)
  const activeChat = useChatStore((s) => s.activeChat)
  const companyBots = useBotStore((s) => s.companyBots)
  const inviteBotToChat = useBotStore((s) => s.inviteBotToChat)
  const removeBotFromChat = useBotStore((s) => s.removeBotFromChat)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const blockUser = useContactsStore((s) => s.blockUser)
  const removeContact = useContactsStore((s) => s.removeContact)
  const [showBotPicker, setShowBotPicker] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isMuted, setIsMuted] = useState(activeChat?.muted ?? false)
  const [showMutePicker, setShowMutePicker] = useState(false)
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>('photos')
  const [mediaCounts, setMediaCounts] = useState<Record<string, number>>({})
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [commonGroupsCount, setCommonGroupsCount] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  useEffect(() => {
    if (!activeChat) return
    api.get(`/chats/${activeChat.id}/media-counts`)
      .then(({ data }) => setMediaCounts(data))
      .catch(() => {})
  }, [activeChat])

  useEffect(() => {
    if (!activeChat || activeChat.type !== 'private') return
    api.get(`/chats/${activeChat.id}/members`).then(({ data }) => {
      const other = data.find((m: { userId: string; user: User }) => m.userId !== currentUserId)
      if (other) setOtherUser(other.user)
    }).catch(() => {})
  }, [activeChat, currentUserId])

  useEffect(() => {
    if (!activeChat || activeChat.type === 'group' || activeChat.type === 'channel') return
    const peerId = otherUser?.id
    if (!peerId) return
    api.get(`/users/${peerId}/common-groups`).then(({ data }) => {
      setCommonGroupsCount(Array.isArray(data) ? data.length : data.count ?? 0)
    }).catch(() => {})
  }, [activeChat, otherUser])

  if (!activeChat) return null

  const isChannel = activeChat.type === 'channel'
  const isGroupLike = activeChat.type === 'group' || isChannel || activeChat.type === 'crossCompany'
  const isAdmin = activeChat.myRole === 'admin' || activeChat.myRole === 'owner'
  const displayName = isChannel ? `# ${activeChat.name ?? 'channel'}` : activeChat.name ?? 'Chat'
  const initials = isChannel
    ? '#'
    : displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const colorMap: Record<string, string> = {
    private: '#6366f1',
    group: '#059669',
    channel: '#8b5cf6',
    bot: '#FF9220',
  }
  const avatarColor = colorMap[activeChat.type] ?? '#6366f1'
  const chatMembers = activeChat.members as { userId: string }[] | undefined

  if (showAdminPanel && isAdmin && isGroupLike) {
    return (
      <ChannelAdminPanel
        chat={activeChat}
        onClose={() => setShowAdminPanel(false)}
      />
    )
  }

  const handleAddBot = async (bot: BotType) => {
    try {
      await inviteBotToChat(bot.id, activeChat.id)
      setShowBotPicker(false)
    } catch {
      // handled silently
    }
  }

  const handleRemoveBot = async (botId: string) => {
    try {
      await removeBotFromChat(botId, activeChat.id)
    } catch {
      // handled silently
    }
  }

  const handleAction = (label: string) => {
    const peerId = otherUser?.id
    switch (label) {
      case 'Share this contact':
        if (peerId) navigator.clipboard.writeText(`${import.meta.env.VITE_APP_URL || window.location.origin}/u/${otherUser?.username ?? peerId}`)
        break
      case 'Edit contact':
        if (peerId) navigate(`/contacts/${peerId}/edit`)
        break
      case 'Delete contact':
        setShowDeleteConfirm(true)
        break
      case 'Add to group':
        break
      case 'Block user':
        setShowBlockConfirm(true)
        break
    }
  }

  return (
    <div className="flex h-screen flex-shrink-0 flex-col border-l border-gray-100 bg-white dark:border-[#1E3035] dark:bg-[#152022]" style={{ width: '100%' }}>
      <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-[#1E3035]">
        <h3 className="text-sm font-semibold text-holio-text">
          {isGroupLike ? 'Group Info' : 'Contact Info'}
        </h3>
        <button
          onClick={() => setShowInfoPanel(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {/* Notifications toggle */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {isMuted ? (
              <BellOff className="h-5 w-5 text-holio-muted" />
            ) : (
              <Bell className="h-5 w-5 text-holio-muted" />
            )}
            <span className="text-sm text-holio-text">Notifications</span>
          </div>
          <div className="relative">
            <button
              onClick={() => {
                if (isMuted) {
                  api.post(`/chats/${activeChat.id}/unmute`).then(() => setIsMuted(false)).catch(() => {})
                } else {
                  setShowMutePicker(!showMutePicker)
                }
              }}
              className={`h-6 w-10 rounded-full p-0.5 transition-colors ${
                isMuted ? 'bg-gray-300' : 'bg-holio-orange'
              }`}
              aria-label="Toggle notifications"
            >
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                isMuted ? 'translate-x-0' : 'translate-x-4'
              }`} />
            </button>
            {showMutePicker && (
              <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {[
                  { label: '1 hour', value: '1h' },
                  { label: '8 hours', value: '8h' },
                  { label: '2 days', value: '2d' },
                  { label: 'Until I turn it on', value: 'forever' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      api.post(`/chats/${activeChat.id}/mute`, { duration: opt.value })
                        .then(() => { setIsMuted(true); setShowMutePicker(false) })
                        .catch(() => {})
                    }}
                    className="flex w-full px-3 py-2 text-left text-sm text-holio-text hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-[#1E3035]" />

        {/* Contact details */}
        {!isGroupLike && (
          <>
            <div className="space-y-0">
              <div className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <Phone className="h-5 w-5 flex-shrink-0 text-holio-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-holio-text">{otherUser?.phone ?? 'No phone'}</p>
                  <p className="text-[12px] text-holio-muted">Mobile</p>
                </div>
              </div>
              <div className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-5 w-5 flex-shrink-0 text-holio-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-holio-text">{otherUser?.bio ?? 'No bio set'}</p>
                  <p className="text-[12px] text-holio-muted">Bio</p>
                </div>
              </div>
              <div className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <AtSign className="h-5 w-5 flex-shrink-0 text-holio-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-holio-text">@{otherUser?.username ?? displayName.replace(/\s+/g, '')}</p>
                  <p className="text-[12px] text-holio-muted">Username</p>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-100 dark:bg-[#1E3035]" />
          </>
        )}

        {/* Avatar + name section */}
        {isGroupLike && (
          <>
            <div className="flex flex-col items-center px-4 py-5">
              {activeChat.avatarUrl ? (
                <img
                  src={activeChat.avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}
              <h4 className="mt-3 text-base font-semibold text-holio-text">
                {displayName}
              </h4>
              <p className="text-xs text-holio-muted">
                {chatMembers?.length ?? 0} members
              </p>
            </div>
            <div className="h-px bg-gray-100 dark:bg-[#1E3035]" />
          </>
        )}

        {isGroupLike && isAdmin && (
          <div className="px-4 py-3">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex w-full items-center gap-3 rounded-lg bg-holio-lavender/10 px-3 py-2.5 transition-colors hover:bg-holio-lavender/20"
            >
              <Shield className="h-4 w-4 text-holio-lavender" />
              <span className="text-sm font-medium text-holio-text">Admin Panel</span>
              <ChevronRight className="ml-auto h-4 w-4 text-holio-muted" />
            </button>
          </div>
        )}

        {/* Media statistics grid -- Telegram-style list with count + size */}
        <div className="px-4 py-3">
          <div className="space-y-0">
            {MEDIA_TABS.map((tab) => {
              const count = mediaCounts[tab.apiType] ?? 0
              const totalSize = mediaCounts[`${tab.apiType}Size`] ?? 0
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMediaTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                    activeMediaTab === tab.id && 'bg-gray-50 dark:bg-gray-800',
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-holio-muted" />
                  <span className="flex-1 text-sm text-holio-text">{formatCount(count)} {tab.label}</span>
                  {totalSize > 0 && (
                    <span className="text-xs text-holio-muted">{formatFileSize(totalSize)}</span>
                  )}
                </button>
              )
            })}
            <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <Users className="h-5 w-5 flex-shrink-0 text-holio-muted" />
              <span className="flex-1 text-sm text-holio-text">Group in common</span>
              <span className="text-xs text-holio-muted">{commonGroupsCount}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-[#1E3035]" />

        {/* Bots in this chat */}
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h5 className="text-xs font-semibold tracking-wide text-holio-muted uppercase">
              Bots in this chat
            </h5>
            <button
              onClick={() => setShowBotPicker(!showBotPicker)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-holio-lavender/20 hover:text-holio-orange"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {showBotPicker && (
            <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-1.5 text-[11px] text-holio-muted">
                Add a bot to this chat
              </p>
              {companyBots.length === 0 ? (
                <p className="py-2 text-center text-xs text-holio-muted">
                  No bots available
                </p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {companyBots.map((bot) => {
                    const Icon = BOT_TYPE_ICON[bot.type] ?? Bot
                    const color = BOT_TYPE_COLOR[bot.type] ?? BOT_TYPE_COLOR.custom
                    return (
                      <button
                        key={bot.id}
                        onClick={() => handleAddBot(bot)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white dark:hover:bg-gray-700"
                      >
                        <div
                          className={cn(
                            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                            color,
                          )}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-holio-text">
                            {bot.name}
                          </p>
                        </div>
                        <Plus className="h-3 w-3 text-holio-muted" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {companyBots.filter((b) => b.isActive).length > 0 ? (
            <div className="space-y-1">
              {companyBots
                .filter((b) => b.isActive)
                .map((bot) => {
                  const Icon = BOT_TYPE_ICON[bot.type] ?? Bot
                  const color = BOT_TYPE_COLOR[bot.type] ?? BOT_TYPE_COLOR.custom
                  return (
                    <div
                      key={bot.id}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                          color,
                        )}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-holio-text">
                          {bot.name}
                        </p>
                        <p className="truncate text-[11px] capitalize text-holio-muted">
                          {bot.type}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/bots/${bot.id}/analytics`)}
                        className="rounded-full p-1 text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
                        title="Configure"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveBot(bot.id)}
                        className="rounded-full p-1 text-holio-muted transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-holio-muted">
              No bots in this chat
            </p>
          )}
        </div>

        <div className="h-px bg-gray-100 dark:bg-[#1E3035]" />

        {/* Action buttons */}
        <div className="px-4 py-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => handleAction(action.label)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Icon
                  className={`h-5 w-5 ${action.variant === 'danger' ? 'text-red-500' : 'text-holio-muted'}`}
                />
                <span
                  className={`text-sm ${action.variant === 'danger' ? 'text-red-500' : 'text-holio-text'}`}
                >
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-[#1E3035]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-holio-text">Delete contact</h3>
            <p className="mt-2 text-sm text-holio-muted">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const peerId = otherUser?.id
                  if (peerId) {
                    try {
                      await removeContact(peerId)
                    } catch { /* handled */ }
                  }
                  setShowDeleteConfirm(false)
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBlockConfirm(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-[#1E3035]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-holio-text">Block user</h3>
            <p className="mt-2 text-sm text-holio-muted">
              Are you sure you want to block this user? They will no longer be able to message you.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-holio-text transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const peerId = otherUser?.id
                  if (peerId) {
                    try {
                      await blockUser(peerId)
                    } catch { /* handled */ }
                  }
                  setShowBlockConfirm(false)
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
