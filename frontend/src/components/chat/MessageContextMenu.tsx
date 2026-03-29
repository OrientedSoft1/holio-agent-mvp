import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Reply,
  Pencil,
  Trash2,
  Forward,
  Pin,
  PinOff,
  Copy,
  Hash,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const QUICK_REACTIONS = ['😊', '👍', '❤️', '🔥', '🤯', '😢']

const MENU_WIDTH = 224
const MENU_PADDING = 8

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

function clampPosition(
  x: number,
  y: number,
  menuHeight: number
): { left: number; top: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = x
  let top = y

  if (left + MENU_WIDTH + MENU_PADDING > vw) {
    left = vw - MENU_WIDTH - MENU_PADDING
  }
  if (left < MENU_PADDING) {
    left = MENU_PADDING
  }

  if (top + menuHeight + MENU_PADDING > vh) {
    top = vh - menuHeight - MENU_PADDING
  }
  if (top < MENU_PADDING) {
    top = MENU_PADDING
  }

  return { left, top }
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
  const [visible, setVisible] = useState(false)
  const [menuPos, setMenuPos] = useState({ left: x, top: y })

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 150)
  }, [onClose])

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      setMenuPos(clampPosition(x, y, rect.height))
    }
  }, [x, y])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleClose])

  const actions: ContextMenuAction[] = [
    { id: 'reply', label: 'Reply', icon: Reply },
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'forward', label: 'Forward', icon: Forward },
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      icon: isPinned ? PinOff : Pin,
    },
    { id: 'edit', label: 'Edit', icon: Pencil, hidden: !isMine },
    { id: 'addToTags', label: 'Add to Tags', icon: Hash },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ]

  const visibleActions = actions.filter((a) => !a.hidden)

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-150',
          visible ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent'
        )}
        onClick={handleClose}
      />

      <div
        ref={menuRef}
        style={{ left: menuPos.left, top: menuPos.top }}
        className={cn(
          'absolute w-56 origin-top-left transition-all duration-150 ease-out',
          visible
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        )}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
          <div className="flex gap-1 border-b border-gray-100 p-2.5 dark:border-gray-800">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAction(`react:${emoji}`)
                  handleClose()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="py-1">
            {visibleActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onAction(action.id)
                  handleClose()
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  action.danger
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                    : 'text-holio-text hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800'
                )}
              >
                <action.icon className="h-[18px] w-[18px]" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
