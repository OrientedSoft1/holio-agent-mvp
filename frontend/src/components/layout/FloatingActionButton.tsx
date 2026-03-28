import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Users, Hash } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FabAction {
  id: string
  icon: typeof Pencil
  label: string
  onClick: () => void
}

interface FloatingActionButtonProps {
  onNewChat?: () => void
  onNewGroup?: () => void
  onNewChannel?: () => void
}

export default function FloatingActionButton({
  onNewChat,
  onNewGroup,
  onNewChannel,
}: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const actions: FabAction[] = [
    { id: 'chat', icon: Pencil, label: 'New Chat', onClick: () => { onNewChat?.(); setOpen(false) } },
    { id: 'group', icon: Users, label: 'New Group', onClick: () => { onNewGroup?.(); setOpen(false) } },
    { id: 'channel', icon: Hash, label: 'New Channel', onClick: () => { onNewChannel?.(); setOpen(false) } },
  ]

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6"
    >
      {/* Expanded action items */}
      <div
        className={cn(
          'flex flex-col gap-2 transition-all duration-200',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        {actions.map((action, i) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex items-center gap-3 transition-all duration-200"
            style={{
              transitionDelay: open ? `${i * 50}ms` : '0ms',
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
            }}
          >
            <span className="whitespace-nowrap rounded-lg bg-holio-dark px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              {action.label}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange shadow-lg shadow-holio-orange/30">
              <action.icon className="h-5 w-5 text-white" />
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-[53px] w-[53px] items-center justify-center rounded-full bg-holio-orange shadow-lg shadow-holio-orange/30 transition-transform duration-200',
          open && 'rotate-45',
        )}
        aria-label={open ? 'Close menu' : 'Create new'}
      >
        <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
      </button>
    </div>
  )
}
