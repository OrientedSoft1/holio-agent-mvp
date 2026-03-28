import { useRef, useEffect } from 'react'
import {
  Reply,
  Pencil,
  Trash2,
  Forward,
  Pin,
  PinOff,
  Copy,
} from 'lucide-react'

export interface ContextMenuAction {
  id: string
  label: string
  icon: typeof Reply
  danger?: boolean
  hidden?: boolean
}

interface MessageContextMenuProps {
  x: number
  y: number
  isMine: boolean
  isPinned?: boolean
  onAction: (action: string) => void
  onClose: () => void
}

export default function MessageContextMenu({
  x,
  y,
  isMine,
  isPinned,
  onAction,
  onClose,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const viewH = window.innerHeight
    const viewW = window.innerWidth
    if (rect.bottom > viewH) {
      menuRef.current.style.top = `${y - rect.height}px`
    }
    if (rect.right > viewW) {
      menuRef.current.style.left = `${x - rect.width}px`
    }
  }, [x, y])

  const actions: ContextMenuAction[] = [
    { id: 'reply', label: 'Reply', icon: Reply },
    { id: 'edit', label: 'Edit', icon: Pencil, hidden: !isMine },
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'forward', label: 'Forward', icon: Forward },
    { id: 'pin', label: isPinned ? 'Unpin' : 'Pin', icon: isPinned ? PinOff : Pin },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true, hidden: !isMine },
  ]

  const visible = actions.filter((a) => !a.hidden)

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{ top: y, left: x }}
    >
      {visible.map((action) => (
        <button
          key={action.id}
          onClick={() => {
            onAction(action.id)
            onClose()
          }}
          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
            action.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-holio-text hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </button>
      ))}
    </div>
  )
}
