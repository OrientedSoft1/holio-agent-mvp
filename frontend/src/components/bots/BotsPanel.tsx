import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Bot,
  DollarSign,
  Megaphone,
  Users,
  Headphones,
  Server,
  Sparkles,
  Plus,
  BookOpen,
} from 'lucide-react'
import { useBotStore } from '../../stores/botStore'
import { useCompanyStore } from '../../stores/companyStore'
import { useChatStore } from '../../stores/chatStore'
import { cn } from '../../lib/utils'
import type { Bot as BotType } from '../../types'

const TYPE_ICON: Record<string, typeof Bot> = {
  cfo: DollarSign,
  marketing: Megaphone,
  hr: Users,
  support: Headphones,
  devops: Server,
  accounting: BookOpen,
  custom: Bot,
}

const TYPE_COLOR: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  accounting: 'bg-sky-600',
  custom: 'bg-holio-dark',
}

interface BotsPanelProps {
  onSelectBotChat?: (chatId: string) => void
}

export default function BotsPanel({ onSelectBotChat }: BotsPanelProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const companyBots = useBotStore((s) => s.companyBots)
  const loading = useBotStore((s) => s.loading)
  const fetchCompanyBots = useBotStore((s) => s.fetchCompanyBots)
  const startBotChat = useBotStore((s) => s.startBotChat)
  const activeCompany = useCompanyStore((s) => s.activeCompany)

  useEffect(() => {
    if (activeCompany?.id) fetchCompanyBots(activeCompany.id)
  }, [activeCompany?.id, fetchCompanyBots])

  const filtered = useMemo(() => {
    if (!search.trim()) return companyBots
    const q = search.toLowerCase()
    return companyBots.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q),
    )
  }, [companyBots, search])

  const handleBotClick = async (bot: BotType) => {
    try {
      const chat = await startBotChat(bot.id)
      const { chats } = useChatStore.getState()
      if (!chats.some((c) => c.id === chat.id)) {
        useChatStore.setState({ chats: [chat, ...chats] })
      }
      onSelectBotChat?.(chat.id)
    } catch {
      // handled by store
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-shrink-0 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-holio-text">Bots</h2>
          <button onClick={() => navigate('/bots')} title="Bot Store" className="transition-colors hover:text-holio-orange/80">
            <Sparkles className="h-5 w-5 text-holio-orange" />
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <Search className="h-4 w-4 text-holio-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bots..."
            className="flex-1 bg-transparent text-sm text-holio-text outline-none placeholder:text-holio-muted"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5 text-holio-muted" />
            </button>
          )}
        </div>
        <button
          onClick={() => navigate('/bots')}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-holio-orange px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-holio-orange/90"
        >
          <Plus className="h-4 w-4" />
          Add Bot
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && companyBots.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender/20">
              <Bot className="h-8 w-8 text-holio-lavender" />
            </div>
            <p className="mt-4 text-sm font-medium text-holio-text">
              {search ? `No bots match "${search}"` : 'No bots yet'}
            </p>
            {!search && (
              <p className="mt-1 text-xs text-holio-muted">
                Add AI agents from the Bot Store
              </p>
            )}
            {!search && (
              <button
                onClick={() => navigate('/bots')}
                className="mt-3 rounded-lg bg-holio-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-holio-orange/90"
              >
                Browse Bot Store
              </button>
            )}
          </div>
        )}

        {filtered.map((bot) => {
          const Icon = TYPE_ICON[bot.type] ?? Bot
          const color = TYPE_COLOR[bot.type] ?? TYPE_COLOR.custom

          return (
            <button
              key={bot.id}
              onClick={() => handleBotClick(bot)}
              className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"
            >
              <div
                className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
                  color,
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-holio-text">
                    {bot.name}
                  </p>
                  <div
                    className={cn(
                      'h-2 w-2 flex-shrink-0 rounded-full',
                      bot.isActive ? 'bg-holio-sage' : 'bg-gray-300',
                    )}
                  />
                </div>
                {bot.description && (
                  <p className="truncate text-xs text-holio-muted">
                    {bot.description}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-holio-muted">
                {bot.type}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
