import { useState, useEffect, useRef, useCallback } from 'react'
import { Pencil, MessageCirclePlus, Users, Megaphone } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FloatingActionButtonProps {
  onNewChat?: () => void
  onNewGroup?: () => void
  onNewChannel?: () => void
}

const FAB_SIZE = 53
const ACTION_ICON_SIZE = 36
const ACTION_SPACING = 44

const actions = [
  { id: 'channel', icon: Megaphone, label: 'New Channel' },
  { id: 'group', icon: Users, label: 'New Group' },
  { id: 'chat', icon: MessageCirclePlus, label: 'New Chat' },
] as const

type ActionId = (typeof actions)[number]['id']

export default function FloatingActionButton({
  onNewChat,
  onNewGroup,
  onNewChannel,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  const handlers: Record<ActionId, (() => void) | undefined> = {
    chat: onNewChat,
    group: onNewGroup,
    channel: onNewChannel,
  }

  useEffect(() => {
    if (!isOpen) return

    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, close])

  const expandedHeight = FAB_SIZE + actions.length * ACTION_SPACING

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6"
    >
      <div
        className="relative rounded-full bg-holio-orange shadow-lg transition-[height] duration-300 ease-in-out"
        style={{
          width: FAB_SIZE,
          height: isOpen ? expandedHeight : FAB_SIZE,
        }}
      >
        {actions.map((action, i) => (
          <button
            key={action.id}
            onClick={() => {
              handlers[action.id]?.()
              close()
            }}
            className={cn(
              'absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full',
              'transition-all duration-200',
              isOpen
                ? 'scale-100 opacity-100'
                : 'pointer-events-none scale-75 opacity-0',
            )}
            style={{
              width: ACTION_ICON_SIZE,
              height: ACTION_ICON_SIZE,
              top: 8 + i * ACTION_SPACING,
              transitionDelay: isOpen ? `${(i + 1) * 50}ms` : '0ms',
            }}
            aria-label={action.label}
          >
            <action.icon className="h-5 w-5 text-white" strokeWidth={2} />
          </button>
        ))}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute bottom-0 left-0 flex items-center justify-center rounded-full transition-transform duration-300"
          style={{ width: FAB_SIZE, height: FAB_SIZE }}
          aria-label={isOpen ? 'Close menu' : 'Create new'}
        >
          <Pencil
            className={cn(
              'h-6 w-6 text-white transition-transform duration-300',
              isOpen && 'rotate-90 scale-90',
            )}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  )
}
