import { useState, useCallback, useEffect } from 'react'
import { Check, CheckCheck, X, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Message, MessageMetadata, GroupReadReceipt, MessageReaction } from '../../types'
import api from '../../services/api.service'
import { useChatStore } from '../../stores/chatStore'
import ImageMessage from '../messages/ImageMessage'
import ImageViewer from '../messages/ImageViewer'
import VoiceMessage from '../messages/VoiceMessage'
import VideoNote from '../messages/VideoNote'
import FileMessage from '../messages/FileMessage'
import GifMessage from '../messages/GifMessage'
import LinkPreview from '../messages/LinkPreview'
import BotMessage from '../messages/BotMessage'
import PollMessage from '../messages/PollMessage'
import ReactionBar from '../messages/ReactionBar'
import ReactionPicker from '../messages/ReactionPicker'
import MessageContextMenu from './MessageContextMenu'
import TagSelectionPopup from './TagSelectionPopup'
import ForwardMessageModal from './ForwardMessageModal'

export interface MessageData {
  id: string; content: string; timestamp: string; isMine: boolean; senderName?: string; senderColor?: string
  senderType?: 'user' | 'bot' | 'system'; isRead: boolean; isGroup: boolean; readCount?: number
  type: Message['type']; fileUrl?: string | null; metadata?: MessageMetadata | null
  isEdited?: boolean; reactions?: MessageReaction[]; scheduledAt?: string | null; currentUserId?: string
  isPinned?: boolean
}

interface ReplyToData {
  senderName?: string
  content: string
}

interface MessageBubbleProps { message: MessageData; rawMessage?: Message; isSecretChat?: boolean; replyTo?: ReplyToData }

function GroupReadPopup({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const [receipts, setReceipts] = useState<GroupReadReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => {
    try { const { data } = await api.get(`/messages/${messageId}/group-reads`); setReceipts(data) }
    catch { /* ignore */ } finally { setLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return (
    <div className="absolute right-0 bottom-6 z-50 w-48 rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-holio-text">Read by</span>
        <button onClick={onClose} className="rounded-full p-0.5 text-holio-muted hover:text-holio-text"><X className="h-3 w-3" /></button>
      </div>
      {loading ? <p className="py-2 text-center text-[10px] text-holio-muted">Loading...</p>
       : receipts.length === 0 ? <p className="py-2 text-center text-[10px] text-holio-muted">No readers yet</p>
       : <div className="max-h-32 space-y-1 overflow-y-auto">{receipts.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5 py-0.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-holio-lavender/30 text-[8px] font-semibold text-holio-text">{r.user.firstName[0]}</div>
            <span className="truncate text-[10px] text-holio-text">{r.user.firstName} {r.user.lastName ?? ''}</span>
          </div>))}</div>}
    </div>
  )
}

function BubbleTail({ isMine, isSecretChat }: { isMine: boolean; isSecretChat?: boolean }) {
  const sentColor = isSecretChat ? '#C6D5BA' : '#FF9220'
  return (
    <svg className={cn('absolute bottom-0 h-3 w-3', isMine ? '-right-1.5' : '-left-1.5')} viewBox="0 0 12 12">
      <path d={isMine ? 'M0 0 L0 12 L12 12 Q4 12 0 0Z' : 'M12 0 L12 12 L0 12 Q8 12 12 0Z'} fill={isMine ? sentColor : '#ffffff'} />
    </svg>
  )
}

export default function MessageBubble({ message, rawMessage, isSecretChat, replyTo }: MessageBubbleProps) {
  const [viewerImages, setViewerImages] = useState<string[] | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [showReadPopup, setShowReadPopup] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showTagPopup, setShowTagPopup] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const setReplyTo = useChatStore((s) => s.setReplyTo)

  const reactions = message.reactions ?? []
  const setEditing = useChatStore((s) => s.setEditing)
  const removeMessage = useChatStore((s) => s.removeMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)

  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }
  const handleContextAction = async (action: string) => {
    setContextMenu(null)
    if (action.startsWith('react:')) {
      await handleReact(action.slice(6))
      return
    }
    switch (action) {
      case 'reply': if (rawMessage) setReplyTo(rawMessage); break
      case 'edit': if (rawMessage) setEditing(rawMessage); break
      case 'copy': if (message.content) await navigator.clipboard.writeText(message.content); break
      case 'forward': setShowForwardModal(true); break
      case 'pin': try { await api.post(`/messages/${message.id}/pin`); updateMessage(message.id, { isPinned: !message.isPinned } as Partial<Message>) } catch { /* ignore */ } break
      case 'addToTags': setShowTagPopup(true); break
      case 'delete': try { await api.delete(`/messages/${message.id}`); removeMessage(message.id) } catch { /* ignore */ } break
    }
  }

  const isBotMessage = message.senderType === 'bot' || message.type === 'botResult'
  const isScheduled = !!message.scheduledAt
  const handleReact = async (emoji: string) => {
    setShowReactionPicker(false)
    try {
      await api.post(`/messages/${message.id}/reactions`, { emoji })
      const prev = message.reactions ?? []
      const existing = prev.find((r) => r.emoji === emoji)
      let next: MessageReaction[]
      if (existing) {
        if (existing.reacted) next = existing.count <= 1 ? prev.filter((r) => r.emoji !== emoji) : prev.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r)
        else next = prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r)
      } else {
        next = [...prev, { emoji, count: 1, reacted: true }]
      }
      updateMessage(message.id, { reactions: next } as Partial<Message>)
    } catch { /* ignore */ }
  }
  const handleToggleReaction = (emoji: string) => handleReact(emoji)

  if (isBotMessage) return <BotMessage content={message.content} botName={message.metadata?.botName ?? message.senderName ?? 'AI Agent'} botType={message.metadata?.botType} timestamp={message.timestamp} />

  if (message.type === 'poll' && message.metadata?.poll) {
    const poll = message.metadata.poll
    return (
      <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
        <div>
          {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 text-xs font-medium" style={message.senderColor ? { color: message.senderColor } : undefined}>{message.senderName}</p>}
          <PollMessage poll={poll} isMine={message.isMine} currentUserId={message.currentUserId}
            onVote={async (optionId) => { try { await api.post(`/messages/${message.id}/poll-vote`, { optionId }) } catch { /* ignored */ } }}
            onClose={async () => { try { await api.post(`/messages/${message.id}/poll-close`) } catch { /* ignored */ } }} />
          <div className={cn('mt-1 flex items-center gap-1', message.isMine ? 'justify-end' : 'justify-start')}><span className="text-[11px] text-holio-muted">{message.timestamp}</span></div>
          <ReactionBar reactions={reactions} onToggle={handleToggleReaction} onAdd={() => setShowReactionPicker(true)} />
        </div>
      </div>
    )
  }

  const openViewer = (index: number, images: string[]) => { setViewerImages(images); setViewerIndex(index) }
  const isMedia = message.type === 'image' || message.type === 'gif' || message.type === 'videoNote'

  const renderReplyQuote = () => {
    if (!replyTo) return null
    return (
      <div className={cn(
        'mb-1.5 rounded-lg border-l-[3px] px-2.5 py-1.5',
        message.isMine ? 'border-white/60 bg-white/15' : 'border-holio-orange bg-holio-orange/8',
      )}>
        <p className={cn('text-[12px] font-semibold', message.isMine ? 'text-white' : 'text-holio-orange')}>
          {replyTo.senderName ?? 'Message'}
        </p>
        <p className={cn('line-clamp-2 text-[12px]', message.isMine ? 'text-white/80' : 'text-holio-muted')}>
          {replyTo.content || 'Media message'}
        </p>
      </div>
    )
  }

  const renderContent = () => {
    switch (message.type) {
      case 'image': return <ImageMessage fileUrl={message.fileUrl} files={message.metadata?.files} caption={message.content} isMine={message.isMine} onImageClick={openViewer} />
      case 'voice': return message.fileUrl ? <VoiceMessage fileUrl={message.fileUrl} duration={message.metadata?.duration} fileSize={message.metadata?.files?.[0]?.size} isViewOnce={message.metadata?.isViewOnce} isMine={message.isMine} /> : null
      case 'videoNote': return message.fileUrl ? <VideoNote fileUrl={message.fileUrl} duration={message.metadata?.duration} isMine={message.isMine} /> : null
      case 'file': { const file = message.metadata?.files?.[0]; return file ? <FileMessage fileName={file.name} fileSize={file.size} fileUrl={file.url} isMine={message.isMine} /> : null }
      case 'gif': return message.fileUrl ? <GifMessage fileUrl={message.fileUrl} caption={message.content} isMine={message.isMine} /> : null
      default: return (<><p className="text-sm leading-relaxed">{message.content}</p>{message.metadata?.linkPreview && <LinkPreview preview={message.metadata.linkPreview} isMine={message.isMine} />}</>)
    }
  }

  const readReceiptIcon = message.isMine && (message.isRead ? <CheckCheck className="h-3.5 w-3.5 text-white" /> : <Check className="h-3.5 w-3.5 text-white/60" />)

  const primaryReaction = reactions.length > 0
    ? reactions.reduce((best, r) => (r.count > best.count ? r : best), reactions[0])
    : null

  if (message.type === 'videoNote') {
    return (<>
      <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
        <div>
          {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 text-xs font-medium" style={message.senderColor ? { color: message.senderColor } : undefined}>{message.senderName}</p>}
          {renderContent()}
          <div className={cn('mt-1 flex items-center gap-1', message.isMine ? 'justify-end' : 'justify-start')}><span className="text-[11px] text-holio-muted">{message.timestamp}</span>{readReceiptIcon}</div>
          <ReactionBar reactions={reactions} onToggle={handleToggleReaction} onAdd={() => setShowReactionPicker(true)} />
        </div>
      </div>
      {viewerImages && <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />}
    </>)
  }

  const sentBubbleBg = isSecretChat ? 'bg-holio-sage/40' : 'bg-holio-orange'

  return (<>
    <div className={cn('group relative flex', message.isMine ? 'justify-end' : 'justify-start', primaryReaction ? 'mb-4' : 'mb-1')} onContextMenu={handleContextMenu} onMouseEnter={() => setShowReactionPicker(true)} onMouseLeave={() => setShowReactionPicker(false)}>
      <div className="relative max-w-[70%]">
        {showReactionPicker && <ReactionPicker onReact={handleReact} isMine={message.isMine} />}
        {isScheduled && (<div className="mb-1 flex items-center gap-1 text-[11px] text-holio-muted"><Clock className="h-3 w-3" /><span>Scheduled for {new Date(message.scheduledAt!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>)}
        <div className={cn('relative', isMedia ? 'overflow-hidden rounded-2xl' : 'px-3.5 py-2',
          message.isMine ? (isMedia ? 'rounded-2xl rounded-br-sm' : cn('rounded-2xl rounded-br-sm text-white', sentBubbleBg)) : (isMedia ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl rounded-bl-sm bg-white text-holio-text shadow-sm dark:bg-[#1E3035] dark:text-white'))}>
          {!isMedia && <BubbleTail isMine={message.isMine} isSecretChat={isSecretChat} />}
          {isMedia ? (
            <div className={cn('rounded-2xl p-1', message.isMine ? cn('rounded-br-sm', sentBubbleBg) : 'rounded-bl-sm bg-white shadow-sm dark:bg-[#1E3035]')}>
              {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 px-2 pt-1 text-xs font-medium" style={message.senderColor ? { color: message.senderColor } : undefined}>{message.senderName}</p>}
              {renderContent()}
              <div className={cn('mt-1 flex items-center justify-end gap-1 px-2 pb-1', message.isMine ? 'text-white/70' : 'text-holio-muted')}><span className="text-[11px]">{message.timestamp}</span>{readReceiptIcon}</div>
            </div>
          ) : (<>
            {!message.isMine && message.isGroup && message.senderName && <p className="mb-0.5 text-xs font-medium" style={message.senderColor ? { color: message.senderColor } : undefined}>{message.senderName}</p>}
            {renderReplyQuote()}
            {renderContent()}
            <div className={cn('mt-1 flex items-center justify-end gap-1', message.isMine ? 'text-white/70' : 'text-holio-muted')}>
              {message.isMine && message.isGroup && (message.readCount ?? 0) > 0 && (
                <div className="relative">
                  <button onClick={() => setShowReadPopup(!showReadPopup)} className="mr-1 text-[10px] text-white/70 underline hover:text-white">Read by {message.readCount}</button>
                  {showReadPopup && <GroupReadPopup messageId={message.id} onClose={() => setShowReadPopup(false)} />}
                </div>)}
              <span className="text-[11px]">{message.timestamp}</span>{readReceiptIcon}
            </div>
          </>)}
          {primaryReaction && (
            <div className={cn('absolute -bottom-2.5 z-10', message.isMine ? 'left-1' : 'right-1')}>
              <button
                onClick={() => handleToggleReaction(primaryReaction.emoji)}
                className="flex items-center gap-0.5 rounded-full border border-gray-100 bg-white px-1.5 py-0.5 text-sm shadow-sm transition-transform hover:scale-110 dark:border-gray-700 dark:bg-gray-800"
              >
                <span>{primaryReaction.emoji}</span>
                {primaryReaction.count > 1 && <span className="text-[10px] text-holio-muted">{primaryReaction.count}</span>}
              </button>
            </div>
          )}
        </div>
        {reactions.length > 1 && <ReactionBar reactions={reactions} onToggle={handleToggleReaction} onAdd={() => setShowReactionPicker(true)} />}
      </div>
    </div>
    {viewerImages && <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />}
    {contextMenu && <MessageContextMenu x={contextMenu.x} y={contextMenu.y} isMine={message.isMine} isPinned={message.isPinned} onAction={handleContextAction} onClose={() => setContextMenu(null)} />}
    <TagSelectionPopup
      open={showTagPopup}
      onClose={() => setShowTagPopup(false)}
      onSave={async (tagIds) => {
        try { await Promise.all(tagIds.map((tagId) => api.post(`/messages/${message.id}/tags`, { tagId }))) } catch { /* ignore */ }
      }}
    />
    <ForwardMessageModal open={showForwardModal} messageId={message.id} onClose={() => setShowForwardModal(false)} />
  </>)
}
