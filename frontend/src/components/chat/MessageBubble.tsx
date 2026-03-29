import { useState, useCallback } from 'react'
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

export interface MessageData {
  id: string; content: string; timestamp: string; isMine: boolean; senderName?: string
  senderType?: 'user' | 'bot' | 'system'; isRead: boolean; isGroup: boolean; readCount?: number
  type: Message['type']; fileUrl?: string | null; metadata?: MessageMetadata | null
  reactions?: MessageReaction[]; scheduledAt?: string | null; currentUserId?: string
}

interface MessageBubbleProps { message: MessageData; rawMessage?: Message }

function GroupReadPopup({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const [receipts, setReceipts] = useState<GroupReadReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => {
    try { const { data } = await api.get(`/messages/${messageId}/group-reads`); setReceipts(data) }
    catch { /* ignore */ } finally { setLoading(false) }
  }, [messageId])
  useState(() => { fetch() })
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

function BubbleTail({ isMine }: { isMine: boolean }) {
  return (
    <svg className={cn('absolute bottom-0 h-3 w-3', isMine ? '-right-1.5' : '-left-1.5')} viewBox="0 0 12 12">
      <path d={isMine ? 'M0 0 L0 12 L12 12 Q4 12 0 0Z' : 'M12 0 L12 12 L0 12 Q8 12 12 0Z'} fill={isMine ? '#C6D5BA' : '#ffffff'} />
    </svg>
  )
}

export default function MessageBubble({ message, rawMessage }: MessageBubbleProps) {
  const [viewerImages, setViewerImages] = useState<string[] | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [showReadPopup, setShowReadPopup] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactions, setReactions] = useState<MessageReaction[]>(message.reactions ?? [])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const setReplyTo = useChatStore((s) => s.setReplyTo)
  const setEditing = useChatStore((s) => s.setEditing)
  const removeMessage = useChatStore((s) => s.removeMessage)

  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }
  const handleContextAction = async (action: string) => {
    setContextMenu(null)
    if (action.startsWith('react:')) { handleReact(action.slice(6)); return }
    switch (action) {
      case 'reply': if (rawMessage) setReplyTo(rawMessage); break
      case 'edit': if (rawMessage) setEditing(rawMessage); break
      case 'copy': if (message.content) await navigator.clipboard.writeText(message.content); break
      case 'forward': setForwardModalOpen(true); break
      case 'pin': try { await api.patch(`/messages/${message.id}/pin`) } catch { /* ignore */ } break
      case 'delete': try { await api.delete(`/chats/${rawMessage?.chatId}/messages/${message.id}`); removeMessage(message.id) } catch { /* ignore */ } break
    }
  }

  const isBotMessage = message.senderType === 'bot' || message.type === 'botResult'
  const isScheduled = !!message.scheduledAt
  const handleReact = async (emoji: string) => {
    setShowReactionPicker(false)
    try {
      await api.post(`/messages/${message.id}/reactions`, { emoji })
      setReactions((prev) => {
        const existing = prev.find((r) => r.emoji === emoji)
        if (existing) {
          if (existing.reacted) return existing.count <= 1 ? prev.filter((r) => r.emoji !== emoji) : prev.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r)
          return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r)
        }
        return [...prev, { emoji, count: 1, reacted: true }]
      })
    } catch { /* ignore */ }
  }
  const handleToggleReaction = (emoji: string) => handleReact(emoji)

  if (isBotMessage) return <BotMessage content={message.content} botName={message.metadata?.botName ?? message.senderName ?? 'AI Agent'} botType={message.metadata?.botType} timestamp={message.timestamp} />

  if (message.type === 'poll' && message.metadata?.poll) {
    const poll = message.metadata.poll
    return (
      <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
        <div>
          {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 text-xs font-medium text-holio-orange">{message.senderName}</p>}
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
  const renderContent = () => {
    switch (message.type) {
      case 'image': return <ImageMessage fileUrl={message.fileUrl} files={message.metadata?.files} caption={message.content} isMine={message.isMine} onImageClick={openViewer} />
      case 'voice': return message.fileUrl ? <VoiceMessage fileUrl={message.fileUrl} duration={message.metadata?.duration} isViewOnce={message.metadata?.isViewOnce} isMine={message.isMine} /> : null
      case 'videoNote': return message.fileUrl ? <VideoNote fileUrl={message.fileUrl} duration={message.metadata?.duration} isMine={message.isMine} /> : null
      case 'file': { const file = message.metadata?.files?.[0]; return file ? <FileMessage fileName={file.name} fileSize={file.size} fileUrl={file.url} isMine={message.isMine} /> : null }
      case 'gif': return message.fileUrl ? <GifMessage fileUrl={message.fileUrl} caption={message.content} isMine={message.isMine} /> : null
      default: return (<><p className="text-sm leading-relaxed">{message.content}</p>{message.metadata?.linkPreview && <LinkPreview preview={message.metadata.linkPreview} isMine={message.isMine} />}</>)
    }
  }

  const readReceiptIcon = message.isMine && (message.isRead ? <CheckCheck className="h-3.5 w-3.5 text-holio-orange" /> : <Check className="h-3.5 w-3.5 text-holio-muted" />)

  if (message.type === 'videoNote') {
    return (<>
      <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
        <div>
          {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 text-xs font-medium text-holio-orange">{message.senderName}</p>}
          {renderContent()}
          <div className={cn('mt-1 flex items-center gap-1', message.isMine ? 'justify-end' : 'justify-start')}><span className="text-[11px] text-holio-muted">{message.timestamp}</span>{readReceiptIcon}</div>
          <ReactionBar reactions={reactions} onToggle={handleToggleReaction} onAdd={() => setShowReactionPicker(true)} />
        </div>
      </div>
      {viewerImages && <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />}
    </>)
  }

  return (<>
    <div className={cn('group relative mb-1 flex', message.isMine ? 'justify-end' : 'justify-start')} onContextMenu={handleContextMenu} onMouseEnter={() => setShowReactionPicker(true)} onMouseLeave={() => setShowReactionPicker(false)}>
      <div className="relative max-w-[70%]">
        {showReactionPicker && <ReactionPicker onReact={handleReact} isMine={message.isMine} />}
        {isScheduled && (<div className="mb-1 flex items-center gap-1 text-[11px] text-holio-muted"><Clock className="h-3 w-3" /><span>Scheduled for {new Date(message.scheduledAt!).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>)}
        <div className={cn('relative', isMedia ? 'overflow-hidden rounded-2xl' : 'px-3.5 py-2',
          message.isMine ? (isMedia ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-br-sm bg-holio-sage text-holio-text') : (isMedia ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl rounded-bl-sm bg-white text-holio-text'))}>
          {!isMedia && <BubbleTail isMine={message.isMine} />}
          {isMedia ? (
            <div className={cn('rounded-2xl p-1', message.isMine ? 'rounded-br-sm bg-holio-sage' : 'rounded-bl-sm bg-white')}>
              {!message.isMine && message.isGroup && message.senderName && <p className="mb-1 px-2 pt-1 text-xs font-medium text-holio-orange">{message.senderName}</p>}
              {renderContent()}
              <div className="mt-1 flex items-center justify-end gap-1 px-2 pb-1 text-holio-muted"><span className="text-[11px]">{message.timestamp}</span>{readReceiptIcon}</div>
            </div>
          ) : (<>
            {!message.isMine && message.isGroup && message.senderName && <p className="mb-0.5 text-xs font-medium text-holio-orange">{message.senderName}</p>}
            {renderContent()}
            <div className="mt-1 flex items-center justify-end gap-1 text-holio-muted">
              {message.isMine && message.isGroup && (message.readCount ?? 0) > 0 && (
                <div className="relative">
                  <button onClick={() => setShowReadPopup(!showReadPopup)} className="mr-1 text-[10px] text-holio-muted underline hover:text-holio-text">Read by {message.readCount}</button>
                  {showReadPopup && <GroupReadPopup messageId={message.id} onClose={() => setShowReadPopup(false)} />}
                </div>)}
              <span className="text-[11px]">{message.timestamp}</span>{readReceiptIcon}
            </div>
          </>)}
        </div>
        <ReactionBar reactions={reactions} onToggle={handleToggleReaction} onAdd={() => setShowReactionPicker(true)} />
      </div>
    </div>
    {viewerImages && <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />}
    {contextMenu && <MessageContextMenu x={contextMenu.x} y={contextMenu.y} isMine={message.isMine} onAction={handleContextAction} onClose={() => setContextMenu(null)} />}
  </>)
}
