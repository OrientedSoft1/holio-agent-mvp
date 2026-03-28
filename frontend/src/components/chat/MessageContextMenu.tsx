import { useRef, useEffect, useState, useCallback } from 'react'
import { Reply, Pencil, Trash2, Forward, Pin, PinOff, Copy } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ContextMenuAction { id: string; label: string; icon: typeof Reply; danger?: boolean; hidden?: boolean }
interface MessageContextMenuProps { x: number; y: number; isMine: boolean; isPinned?: boolean; onAction: (action: string) => void; onClose: () => void }

export default function MessageContextMenu({ isMine, isPinned, onAction, onClose }: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const handleClose = useCallback(() => { setVisible(false); setTimeout(onClose, 200) }, [onClose])
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleClose])
  const actions: ContextMenuAction[] = [
    { id: 'reply', label: 'Reply', icon: Reply }, { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'forward', label: 'Forward', icon: Forward },
    { id: 'pin', label: isPinned ? 'Unpin' : 'Pin', icon: isPinned ? PinOff : Pin },
    { id: 'edit', label: 'Edit', icon: Pencil, hidden: !isMine },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true, hidden: !isMine },
  ]
  const visibleActions = actions.filter((a) => !a.hidden)
  return (
    <div className="fixed inset-0 z-[100]">
      <div className={cn('absolute inset-0 transition-opacity duration-200', visible ? 'bg-black/30' : 'bg-transparent')} onClick={handleClose} />
      <div ref={menuRef} className={cn('absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pb-8 pt-3 shadow-xl transition-transform duration-200 ease-out', visible ? 'translate-y-0' : 'translate-y-full')}>
        <div className="mb-4 flex justify-center"><div className="h-1 w-10 rounded-full bg-gray-300" /></div>
        <div className="grid grid-cols-4 gap-2">
          {visibleActions.map((action) => (
            <button key={action.id} onClick={() => { onAction(action.id); handleClose() }} className={cn('flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors active:bg-gray-100', action.danger ? 'text-red-500' : 'text-holio-text')}>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', action.danger ? 'bg-red-50' : 'bg-gray-100')}><action.icon className="h-5 w-5" /></div>
              <span className="text-[11px] font-medium">{action.label}</span>
            </button>))}
        </div>
      </div>
    </div>
  )
}
