import { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Bell,
  BellOff,
  Users,
  Shield,
  QrCode,
  Link as LinkIcon,
  Image,
  File,
  Mic,
  Play,
  Hash,
  FileText,
} from 'lucide-react'
import { cn } from '../../lib/utils'

type InfoTab = 'posts' | 'media' | 'files' | 'voice' | 'links' | 'gifs'

interface ChannelInfoPanelProps {
  channelName: string
  channelAvatar?: string | null
  subscriberCount: number
  adminCount?: number
  description?: string
  inviteLink?: string
  isPublic?: boolean
  isMuted?: boolean
  onClose: () => void
  onToggleMute?: () => void
}

const TABS: { id: InfoTab; label: string }[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'media', label: 'Media' },
  { id: 'files', label: 'Files' },
  { id: 'voice', label: 'Voice' },
  { id: 'links', label: 'Links' },
  { id: 'gifs', label: 'GIFs' },
]

const TAB_ICON: Record<InfoTab, typeof Hash> = {
  posts: FileText,
  media: Image,
  files: File,
  voice: Mic,
  links: LinkIcon,
  gifs: Play,
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function ChannelInfoPanel({
  channelName,
  channelAvatar,
  subscriberCount,
  adminCount = 3,
  description = 'Official company announcements and updates. Stay informed about the latest news, product launches, and team events.',
  inviteLink = 'holio.app/join/abc123xyz',
  isPublic = true,
  isMuted = false,
  onClose,
  onToggleMute,
}: ChannelInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<InfoTab>('posts')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const initials = channelName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full w-[340px] flex-shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <h3 className="text-sm font-semibold text-holio-text">Channel Info</h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-6 py-6">
          {channelAvatar ? (
            <img
              src={channelAvatar}
              alt={channelName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF9220]/15 text-2xl font-bold text-[#FF9220]">
              {initials}
            </div>
          )}

          <h4 className="mt-3 text-base font-semibold text-holio-text">
            {channelName}
          </h4>
          <p className="mt-0.5 text-xs text-holio-muted">
            {isPublic ? 'public channel' : 'private channel'}
          </p>
        </div>

        {description && (
          <div className="border-t border-gray-100 px-6 py-4">
            <h5 className="mb-1.5 text-xs font-semibold tracking-wide text-holio-muted uppercase">
              Description
            </h5>
            <p className="text-sm leading-relaxed text-holio-text">
              {description}
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 px-6 py-4">
          <h5 className="mb-2 text-xs font-semibold tracking-wide text-holio-muted uppercase">
            Invite Link
          </h5>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
            <LinkIcon className="h-4 w-4 flex-shrink-0 text-[#FF9220]" />
            <span className="min-w-0 flex-1 truncate text-xs font-mono text-holio-text">
              {inviteLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-white hover:text-holio-text"
              title="Copy link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-white hover:text-holio-text"
              title="Show QR code"
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
          </div>
          {showQR && (
            <div className="mt-3 flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white">
                <QrCode className="h-20 w-20 text-holio-text" />
              </div>
              <p className="mt-2 text-[11px] text-holio-muted">
                Scan to join channel
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <BellOff className="h-4 w-4 text-holio-muted" />
            ) : (
              <Bell className="h-4 w-4 text-holio-muted" />
            )}
            <span className="text-sm text-holio-text">Notifications</span>
          </div>
          <button
            onClick={onToggleMute}
            className={cn(
              'h-6 w-10 rounded-full p-0.5 transition-colors',
              isMuted ? 'bg-gray-300' : 'bg-[#FF9220]',
            )}
          >
            <div
              className={cn(
                'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                isMuted ? 'translate-x-0' : 'translate-x-4',
              )}
            />
          </button>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-gray-50 py-3 transition-colors hover:bg-[#D1CBFB]/20">
            <Users className="h-4 w-4 text-holio-muted" />
            <span className="text-sm font-semibold text-holio-text">
              {formatCount(subscriberCount)}
            </span>
            <span className="text-[10px] text-holio-muted">Subscribers</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-gray-50 py-3 transition-colors hover:bg-[#D1CBFB]/20">
            <Shield className="h-4 w-4 text-holio-muted" />
            <span className="text-sm font-semibold text-holio-text">
              {adminCount}
            </span>
            <span className="text-[10px] text-holio-muted">Admins</span>
          </button>
        </div>

        <div className="border-t border-gray-100 px-6 pt-4 pb-2">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-[#FF9220] text-white'
                    : 'bg-gray-100 text-holio-muted hover:bg-gray-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          {(() => {
            const Icon = TAB_ICON[activeTab]
            return (
              <div className="flex flex-col items-center py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Icon className="h-6 w-6 text-holio-muted" />
                </div>
                <p className="mt-3 text-xs text-holio-muted">
                  No {activeTab} shared yet
                </p>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
