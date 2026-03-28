import { useRef, useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { cn } from '../../lib/utils'

interface VideoNoteProps {
  fileUrl: string
  duration?: number
  isMine: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoNote({ fileUrl, duration, isMine }: VideoNoteProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState(duration ?? 0)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className={cn(
        'relative h-48 w-48 cursor-pointer overflow-hidden rounded-full border-4',
        isMine ? 'border-holio-orange' : 'border-gray-200',
      )}
    >
      <video
        ref={videoRef}
        src={fileUrl}
        muted
        loop
        playsInline
        onLoadedMetadata={() => {
          const d = videoRef.current?.duration
          if (d && isFinite(d)) setVideoDuration(d)
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover"
      />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="rounded-full bg-black/50 p-2">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5">
        <span className="text-[11px] font-medium text-white">
          {formatTime(videoDuration)}
        </span>
      </div>
    </div>
  )
}
