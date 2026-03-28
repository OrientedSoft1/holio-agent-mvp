import { cn } from '../../lib/utils'
import type { LinkPreviewData } from '../../types'

interface LinkPreviewProps {
  preview: LinkPreviewData
  isMine: boolean
}

export default function LinkPreview({ preview, isMine }: LinkPreviewProps) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'mt-2 flex gap-3 rounded-lg border p-2 transition-colors',
        isMine
          ? 'border-white/10 bg-white/10 hover:bg-white/20'
          : 'border-gray-200 bg-gray-50 hover:bg-gray-100',
      )}
    >
      {preview.image && (
        <img
          src={preview.image}
          alt=""
          className="h-[60px] w-[60px] flex-shrink-0 rounded-md object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className={cn(
          'truncate text-sm font-semibold',
          isMine ? 'text-white' : 'text-holio-text',
        )}>
          {preview.title}
        </p>
        {preview.description && (
          <p className={cn(
            'line-clamp-2 text-xs',
            isMine ? 'text-white/70' : 'text-holio-muted',
          )}>
            {preview.description}
          </p>
        )}
        <p className={cn(
          'mt-0.5 text-xs',
          isMine ? 'text-white/50' : 'text-holio-muted',
        )}>
          {preview.domain}
        </p>
      </div>
    </a>
  )
}
