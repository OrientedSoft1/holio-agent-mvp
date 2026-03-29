import { useRef, useEffect } from 'react'
import { Image, File, UserCircle, MapPin, BarChart3 } from 'lucide-react'

interface AttachMenuProps {
  onSelect: (type: 'photo' | 'document' | 'contact' | 'location' | 'poll') => void
  onClose: () => void
}

const MENU_ITEMS = [
  { type: 'photo' as const, label: 'Photo / Video', icon: Image, color: 'text-blue-500' },
  { type: 'document' as const, label: 'Document', icon: File, color: 'text-purple-500' },
  { type: 'contact' as const, label: 'Contact', icon: UserCircle, color: 'text-orange-500' },
  { type: 'location' as const, label: 'Location', icon: MapPin, color: 'text-green-500' },
  { type: 'poll' as const, label: 'Poll', icon: BarChart3, color: 'text-holio-orange' },
]

export default function AttachMenu({ onSelect, onClose }: AttachMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
    >
      {MENU_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => {
            onSelect(item.type)
            onClose()
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-holio-text transition-colors hover:bg-gray-50"
        >
          <item.icon className={`h-5 w-5 ${item.color}`} />
          {item.label}
        </button>
      ))}
    </div>
  )
}
