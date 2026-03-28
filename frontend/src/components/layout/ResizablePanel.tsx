import { useState, useRef, useCallback, type ReactNode } from 'react'

interface ResizablePanelProps {
  children: ReactNode
  width: number
  minWidth: number
  maxWidth: number
  onResize: (width: number) => void
  side: 'left' | 'right'
  className?: string
}

export default function ResizablePanel({
  children,
  width,
  minWidth,
  maxWidth,
  onResize,
  side,
  className = '',
}: ResizablePanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      startX.current = e.clientX
      startWidth.current = width

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = side === 'right'
          ? startX.current - moveEvent.clientX
          : moveEvent.clientX - startX.current
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta))
        onResize(newWidth)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [width, minWidth, maxWidth, onResize, side],
  )

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width }}>
      {children}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-holio-lavender/40 ${isDragging ? 'bg-holio-lavender/60' : ''}`}
      />
    </div>
  )
}
