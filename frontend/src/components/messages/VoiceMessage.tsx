import { useState, useRef, useEffect, useMemo } from 'react'
import { Play, Pause, Eye } from 'lucide-react'
import { cn } from '../../lib/utils'

interface VoiceMessageProps {
  fileUrl: string
  duration?: number
  fileSize?: number
  isViewOnce?: boolean
  isMine: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const BAR_COUNT = 30

function generateWaveform(): number[] {
  return Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.85)
}

export default function VoiceMessage({ fileUrl, duration, fileSize, isViewOnce, isMine }: VoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration ?? 0)
  const [speed, setSpeed] = useState(1)
  const waveform = useMemo(() => generateWaveform(), [])

  useEffect(() => {
    const audio = new Audio(fileUrl)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration)
      }
    })
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
        setCurrentTime(audio.currentTime)
      }
    })
    audio.addEventListener('ended', () => {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [fileUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const cycleSpeed = () => {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const filledBars = Math.floor(progress * BAR_COUNT)

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={togglePlay}
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          isMine ? 'bg-white/20 text-white' : 'bg-holio-orange/10 text-holio-orange',
        )}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex h-6 items-end gap-[2px]">
          {waveform.map((h, i) => (
            <div
              key={i}
              className={cn(
                'w-[3px] rounded-full transition-colors',
                i < filledBars
                  ? isMine ? 'bg-white' : 'bg-holio-orange'
                  : isMine ? 'bg-white/30' : 'bg-gray-300',
              )}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-[11px]',
            isMine ? 'text-white/70' : 'text-holio-muted',
          )}>
            {playing ? formatTime(currentTime) : formatTime(audioDuration)}
            {fileSize ? ` ${formatFileSize(fileSize)}` : ''}
          </span>
          <div className="flex items-center gap-2">
            {isViewOnce && (
              <span className={cn(
                'flex items-center gap-0.5 text-[11px]',
                isMine ? 'text-white/70' : 'text-holio-muted',
              )}>
                <Eye className="h-3 w-3" />1
              </span>
            )}
            <button
              onClick={cycleSpeed}
              className={cn(
                'rounded px-1 text-[11px] font-medium',
                isMine ? 'text-white/70 hover:text-white' : 'text-holio-muted hover:text-holio-text',
              )}
            >
              {speed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
