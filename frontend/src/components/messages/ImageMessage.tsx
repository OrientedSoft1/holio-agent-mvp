import { useState } from 'react'
import { cn } from '../../lib/utils'
import type { FileMetadata } from '../../types'

interface ImageMessageProps {
  fileUrl?: string | null
  files?: FileMetadata[]
  caption?: string
  isMine: boolean
  onImageClick: (index: number, images: string[]) => void
}

function ShimmerPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('animate-shimmer rounded-xl', className)} />
  )
}

function SingleImage({
  src,
  onClick,
}: {
  src: string
  onClick: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative max-w-[320px] cursor-pointer overflow-hidden rounded-xl" onClick={onClick}>
      {!loaded && <ShimmerPlaceholder className="absolute inset-0 h-full w-full" />}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className={cn(
          'w-full rounded-xl object-cover transition-opacity',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}

export default function ImageMessage({
  fileUrl,
  files,
  caption,
  isMine,
  onImageClick,
}: ImageMessageProps) {
  const images: string[] = []
  if (files && files.length > 0) {
    files.forEach((f) => images.push(f.url))
  } else if (fileUrl) {
    images.push(fileUrl)
  }

  if (images.length === 0) return null

  const handleClick = (index: number) => () => onImageClick(index, images)

  return (
    <div>
      {images.length === 1 && (
        <SingleImage src={images[0]} onClick={handleClick(0)} />
      )}

      {images.length === 2 && (
        <div className="flex max-w-[320px] gap-1 overflow-hidden rounded-xl">
          {images.map((src, i) => (
            <div key={i} className="flex-1 cursor-pointer" onClick={handleClick(i)}>
              <ImageThumb src={src} className="h-40 w-full" />
            </div>
          ))}
        </div>
      )}

      {images.length >= 3 && (
        <div className="grid max-w-[320px] grid-cols-2 gap-1 overflow-hidden rounded-xl">
          <div className="col-span-2 cursor-pointer" onClick={handleClick(0)}>
            <ImageThumb src={images[0]} className="h-44 w-full" />
          </div>
          {images.slice(1).map((src, i) => (
            <div key={i + 1} className="cursor-pointer" onClick={handleClick(i + 1)}>
              <ImageThumb src={src} className="h-28 w-full" />
            </div>
          ))}
        </div>
      )}

      {caption && (
        <p className={cn(
          'mt-1.5 text-sm',
          isMine ? 'text-white' : 'text-holio-text',
        )}>
          {caption}
        </p>
      )}
    </div>
  )
}

function ImageThumb({ src, className }: { src: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && <ShimmerPlaceholder className="absolute inset-0" />}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
