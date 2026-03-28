import { useState } from 'react'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Message, MessageMetadata } from '../../types'
import ImageMessage from '../messages/ImageMessage'
import ImageViewer from '../messages/ImageViewer'
import VoiceMessage from '../messages/VoiceMessage'
import VideoNote from '../messages/VideoNote'
import FileMessage from '../messages/FileMessage'
import GifMessage from '../messages/GifMessage'
import LinkPreview from '../messages/LinkPreview'

export interface MessageData {
  id: string
  content: string
  timestamp: string
  isMine: boolean
  senderName?: string
  isRead: boolean
  isGroup: boolean
  type: Message['type']
  fileUrl?: string | null
  metadata?: MessageMetadata | null
}

interface MessageBubbleProps {
  message: MessageData
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [viewerImages, setViewerImages] = useState<string[] | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  const openViewer = (index: number, images: string[]) => {
    setViewerImages(images)
    setViewerIndex(index)
  }

  const isMedia = message.type === 'image' || message.type === 'gif' || message.type === 'videoNote'

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <ImageMessage
            fileUrl={message.fileUrl}
            files={message.metadata?.files}
            caption={message.content}
            isMine={message.isMine}
            onImageClick={openViewer}
          />
        )

      case 'voice':
        return message.fileUrl ? (
          <VoiceMessage
            fileUrl={message.fileUrl}
            duration={message.metadata?.duration}
            isViewOnce={message.metadata?.isViewOnce}
            isMine={message.isMine}
          />
        ) : null

      case 'videoNote':
        return message.fileUrl ? (
          <VideoNote
            fileUrl={message.fileUrl}
            duration={message.metadata?.duration}
            isMine={message.isMine}
          />
        ) : null

      case 'file': {
        const file = message.metadata?.files?.[0]
        return file ? (
          <FileMessage
            fileName={file.name}
            fileSize={file.size}
            fileUrl={file.url}
            isMine={message.isMine}
          />
        ) : null
      }

      case 'gif':
        return message.fileUrl ? (
          <GifMessage
            fileUrl={message.fileUrl}
            caption={message.content}
            isMine={message.isMine}
          />
        ) : null

      default:
        return (
          <>
            <p className="text-sm leading-relaxed">{message.content}</p>
            {message.metadata?.linkPreview && (
              <LinkPreview preview={message.metadata.linkPreview} isMine={message.isMine} />
            )}
          </>
        )
    }
  }

  if (message.type === 'videoNote') {
    return (
      <>
        <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
          <div>
            {!message.isMine && message.isGroup && message.senderName && (
              <p className="mb-1 text-xs font-medium text-holio-orange">{message.senderName}</p>
            )}
            {renderContent()}
            <div className={cn('mt-1 flex items-center gap-1', message.isMine ? 'justify-end' : 'justify-start')}>
              <span className="text-[11px] text-holio-muted">{message.timestamp}</span>
              {message.isMine && (message.isRead ? <CheckCheck className="h-3.5 w-3.5 text-holio-muted" /> : <Check className="h-3.5 w-3.5 text-holio-muted" />)}
            </div>
          </div>
        </div>
        {viewerImages && (
          <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />
        )}
      </>
    )
  }

  return (
    <>
      <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-[70%]',
            isMedia ? 'overflow-hidden rounded-2xl' : 'px-3.5 py-2',
            message.isMine
              ? isMedia
                ? 'rounded-2xl rounded-br-sm'
                : 'rounded-2xl rounded-br-sm bg-holio-orange text-white'
              : isMedia
                ? 'rounded-2xl rounded-bl-sm'
                : 'rounded-2xl rounded-bl-sm bg-white text-holio-text',
          )}
        >
          {isMedia ? (
            <div className={cn(
              'rounded-2xl p-1',
              message.isMine
                ? 'rounded-br-sm bg-holio-orange'
                : 'rounded-bl-sm bg-white',
            )}>
              {!message.isMine && message.isGroup && message.senderName && (
                <p className="mb-1 px-2 pt-1 text-xs font-medium text-holio-orange">{message.senderName}</p>
              )}
              {renderContent()}
              <div className={cn(
                'mt-1 flex items-center justify-end gap-1 px-2 pb-1',
                message.isMine ? 'text-white/70' : 'text-holio-muted',
              )}>
                <span className="text-[11px]">{message.timestamp}</span>
                {message.isMine && (message.isRead ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}
              </div>
            </div>
          ) : (
            <>
              {!message.isMine && message.isGroup && message.senderName && (
                <p className="mb-0.5 text-xs font-medium text-holio-orange">{message.senderName}</p>
              )}
              {renderContent()}
              <div className={cn(
                'mt-1 flex items-center justify-end gap-1',
                message.isMine ? 'text-white/70' : 'text-holio-muted',
              )}>
                <span className="text-[11px]">{message.timestamp}</span>
                {message.isMine && (message.isRead ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}
              </div>
            </>
          )}
        </div>
      </div>
      {viewerImages && (
        <ImageViewer images={viewerImages} initialIndex={viewerIndex} onClose={() => setViewerImages(null)} />
      )}
    </>
  )
}
