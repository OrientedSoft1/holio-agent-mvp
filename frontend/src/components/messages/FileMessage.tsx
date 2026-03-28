import { Download } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FileMessageProps {
  fileName: string
  fileSize: number
  fileUrl: string
  isMine: boolean
}

function getFileInfo(fileName: string): { color: string; ext: string } {
  const ext = fileName.split('.').pop()?.toUpperCase() ?? ''
  const colorMap: Record<string, string> = {
    PDF: 'bg-red-500',
    DOC: 'bg-blue-500',
    DOCX: 'bg-blue-500',
    XLS: 'bg-green-500',
    XLSX: 'bg-green-500',
    ZIP: 'bg-yellow-500',
    RAR: 'bg-yellow-500',
    '7Z': 'bg-yellow-500',
    PPT: 'bg-orange-500',
    PPTX: 'bg-orange-500',
  }
  return { color: colorMap[ext] ?? 'bg-gray-400', ext: ext.slice(0, 4) }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileMessage({ fileName, fileSize, fileUrl, isMine }: FileMessageProps) {
  const { color, ext } = getFileInfo(fileName)

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-lg p-2',
      isMine ? 'bg-white/10' : 'bg-gray-50',
    )}>
      <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white', color)}>
        <span className="text-[10px] font-bold">{ext}</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className={cn(
          'truncate text-sm font-medium',
          isMine ? 'text-white' : 'text-holio-text',
        )}>
          {fileName}
        </p>
        <p className={cn(
          'text-[11px]',
          isMine ? 'text-white/60' : 'text-holio-muted',
        )}>
          {formatFileSize(fileSize)}
        </p>
      </div>

      <a
        href={fileUrl}
        download={fileName}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors',
          isMine ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-holio-muted hover:bg-gray-100 hover:text-holio-text',
        )}
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  )
}
