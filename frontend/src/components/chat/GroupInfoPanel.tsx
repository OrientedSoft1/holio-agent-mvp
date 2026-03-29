import { useState } from 'react'
import {
  X,
  UserPlus,
  Users,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Chat, ChatMember } from '../../types'

type InfoTab = 'members' | 'media' | 'files' | 'voice' | 'links' | 'gifs'

const INFO_TABS: { key: InfoTab; label: string }[] = [
  { key: 'members', label: 'Members' },
  { key: 'media', label: 'Media' },
  { key: 'files', label: 'Files' },
  { key: 'voice', label: 'Voice' },
  { key: 'links', label: 'Links' },
  { key: 'gifs', label: 'GIFs' },
]

const AVATAR_COLORS = [
  '#E95420', '#8E44AD', '#2980B9', '#27AE60', '#D35400',
  '#C0392B', '#16A085', '#F39C12', '#2C3E50', '#9B59B6',
]

function getMemberColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface GroupInfoPanelProps {
  chat: Chat
  members?: ChatMember[]
  onClose: () => void
  onAddMembers?: () => void
}

export default function GroupInfoPanel({
  chat,
  members = [],
  onClose,
  onAddMembers,
}: GroupInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<InfoTab>('members')
  const [notifications, setNotifications] = useState(!chat.muted)

  const groupName = chat.name ?? 'Group'

  const colorMap: Record<string, string> = {
    group: '#8b5cf6',
    channel: '#6366f1',
  }
  const color = colorMap[chat.type] ?? '#8b5cf6'

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <h2 className="text-base font-semibold text-holio-text">Group Info</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100 hover:text-holio-text"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-6 pb-4 pt-8">
          {chat.avatarUrl ? (
            <img
              src={chat.avatarUrl}
              alt={groupName}
              className="h-[100px] w-[100px] rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              <Users className="h-10 w-10" />
            </div>
          )}
          <h2 className="mt-4 text-xl font-bold text-holio-text">{groupName}</h2>
          <p className="mt-1 text-sm text-holio-muted">{members.length} members</p>
        </div>

        {chat.description && (
          <div className="mx-4 mb-3 rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-holio-text">{chat.description}</p>
          </div>
        )}

        <div className="mx-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-holio-text">Notifications</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                notifications ? 'bg-holio-orange' : 'bg-gray-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  notifications && 'translate-x-5',
                )}
              />
            </button>
          </div>

          {onAddMembers && (
            <>
              <div className="mx-4 h-px bg-gray-100" />
              <button
                onClick={onAddMembers}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <UserPlus className="h-5 w-5 text-holio-orange" />
                <span className="text-sm font-medium text-holio-orange">Add Members</span>
              </button>
            </>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 px-4 scrollbar-none">
            {INFO_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 border-b-2 px-3 pb-2 pt-2 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-holio-orange text-holio-orange'
                    : 'border-transparent text-holio-muted hover:text-holio-text',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'members' && (
          <div className="divide-y divide-gray-50">
            {members.map((member) => {
              const memberInitial = member.user.firstName?.[0]?.toUpperCase() ?? '?'
              const memberName = `${member.user.firstName}${member.user.lastName ? ` ${member.user.lastName}` : ''}`

              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.firstName}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: getMemberColor(member.userId) }}
                    >
                      {memberInitial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-holio-text">
                      {memberName}
                    </p>
                    <p className="text-xs text-holio-muted">last seen recently</p>
                  </div>
                  {member.role !== 'member' && (
                    <span className="flex-shrink-0 rounded bg-holio-orange/10 px-2 py-0.5 text-[11px] font-medium text-holio-orange">
                      {member.role}
                    </span>
                  )}
                </div>
              )
            })}
            {members.length === 0 && (
              <div className="py-10 text-center text-sm text-holio-muted">No members</div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm bg-gray-100" />
            ))}
          </div>
        )}

        {activeTab !== 'members' && activeTab !== 'media' && (
          <div className="flex flex-col items-center justify-center py-14">
            <p className="text-sm text-holio-muted">No {activeTab} yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
