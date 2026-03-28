import { useState } from 'react'
import {
  X,
  Bell,
  BellOff,
  Image,
  File,
  Play,
  Link,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Ban,
  Bot,
  Plus,
  Settings,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
  Shield,
} from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useChatStore } from '../../stores/chatStore'
import { useBotStore } from '../../stores/botStore'
import { cn } from '../../lib/utils'
import ChannelAdminPanel from '../groups/ChannelAdminPanel'
import api from '../../services/api.service'
import type { Bot as BotType } from '../../types'

const MEDIA_STATS = [
  { label: 'Photos', count: 0, icon: Image },
  { label: 'Videos', count: 0, icon: Play },
  { label: 'Files', count: 0, icon: File },
  { label: 'Links', count: 0, icon: Link },
]

const ACTIONS = [
  { label: 'Add to group', icon: UserPlus, variant: 'default' as const },
  { label: 'Edit contact', icon: Pencil, variant: 'default' as const },
  { label: 'Block user', icon: Ban, variant: 'danger' as const },
  { label: 'Delete contact', icon: Trash2, variant: 'danger' as const },
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

export default function InfoPanel() {
  const setShowInfoPanel = useUiStore((s) => s.setShowInfoPanel)
  const activeChat = useChatStore((s) => s.activeChat)
  const companyBots = useBotStore((s) => s.companyBots)
  const inviteBotToChat = useBotStore((s) => s.inviteBotToChat)
  const removeBotFromChat = useBotStore((s) => s.removeBotFromChat)
  const [showBotPicker, setShowBotPicker] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isMuted, setIsMuted] = useState(activeChat?.muted ?? false)
  const [showMutePicker, setShowMutePicker] = useState(false)

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

  return (
    <div className="flex h-screen w-[300px] flex-shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
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

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-6">
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
          <p className="text-xs text-holio-muted">online</p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            {isMuted ? (
              <BellOff className="h-4 w-4 text-holio-muted" />
            ) : (
              <Bell className="h-4 w-4 text-holio-muted" />
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
              <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
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
                    className="flex w-full px-3 py-2 text-left text-sm text-holio-text hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isGroupLike && isAdmin && (
          <div className="border-t border-gray-100 px-4 py-3">
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

        {/* Bots in this chat */}
        <div className="border-t border-gray-100 px-4 py-3">
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

          {/* Bot picker dropdown */}
          {showBotPicker && (
            <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
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
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white"
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

          {/* Hardcoded demo: show company bots that are active as potential chat bots */}
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

        <div className="border-t border-gray-100 px-4 py-3">
          <h5 className="mb-2 text-xs font-semibold tracking-wide text-holio-muted uppercase">
            Shared Media
          </h5>
          <div className="space-y-1">
            {MEDIA_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <button
                  key={stat.label}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-holio-muted" />
                    <span className="text-sm text-holio-text">
                      {stat.count} {stat.label}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-holio-muted" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50"
              >
                <Icon
                  className={`h-4 w-4 ${action.variant === 'danger' ? 'text-red-500' : 'text-holio-muted'}`}
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
    </div>
  )
}
