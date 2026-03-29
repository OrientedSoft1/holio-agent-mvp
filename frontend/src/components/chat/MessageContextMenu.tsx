import { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Reply, Copy, Link, Download, Tag, BookOpen,
  Forward, Pin, Pencil, Flag, Trash2,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface MessageContextMenuProps {
  x: number
  y: number
  isMine: boolean
  isPinned?: boolean
  messageId?: string
  onAction: (action: string) => void
  onClose: () => void
}

const QUICK_EMOJIS = ['😊', '👍', '❤️', '🔥', '🤯', '😢'] as const

interface MenuAction {
  id: string
  label: string
  icon: typeof Reply
  danger?: boolean
  hidden?: boolean
}

const MENU_WIDTH = 256
const EDGE_PADDING = 12
const EMOJI_ROW_HEIGHT = 52

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
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 180)
  }, [onClose])

  const handleAction = useCallback(
    (action: string) => {
      onAction(action)
      handleClose()
    },
    [onAction, handleClose],
  )

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let posX = x - MENU_WIDTH / 2
    let posY = y + EDGE_PADDING

    if (posX + MENU_WIDTH > vw - EDGE_PADDING) posX = vw - MENU_WIDTH - EDGE_PADDING
    if (posX < EDGE_PADDING) posX = EDGE_PADDING
    if (posY + rect.height > vh - EDGE_PADDING) posY = y - rect.height - EMOJI_ROW_HEIGHT - EDGE_PADDING

    setMenuPos({ x: posX, y: Math.max(EDGE_PADDING, posY) })
  }, [x, y])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  const actions: MenuAction[] = [
    { id: 'reply', label: 'Reply', icon: Reply },
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'copyLink', label: 'Copy Link', icon: Link },
    { id: 'saveToGallery', label: 'Save to Gallery', icon: Download },
    { id: 'addToTags', label: 'Add to Tags', icon: Tag },
    { id: 'addToStory', label: 'Add to Story', icon: BookOpen },
    { id: 'forward', label: 'Forward', icon: Forward },
    { id: 'pin', label: isPinned ? 'Unpin' : 'Pin', icon: Pin },
    { id: 'edit', label: 'Edit', icon: Pencil, hidden: !isMine },
    { id: 'report', label: 'Report', icon: Flag, hidden: isMine },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ]

  const visibleActions = actions.filter((a) => !a.hidden)

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className={cn(
          'absolute inset-0 transition-all duration-200',
          visible
            ? 'bg-black/30 backdrop-blur-sm'
            : 'bg-transparent backdrop-blur-none',
        )}
        onClick={handleClose}
      />

      <div
        ref={menuRef}
        style={{ left: menuPos.x, top: menuPos.y }}
        className={cn(
          'absolute transition-all duration-[180ms] ease-out',
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAction(`react:${emoji}`)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-md transition-transform hover:scale-110 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div
          className="w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-xl"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {visibleActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100',
                  action.danger ? 'text-red-500' : 'text-gray-800',
                )}
              >
                <action.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
