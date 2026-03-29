import { useState, useRef, useEffect, useCallback } from 'react'
import { Trash2, Pause, Play, Send } from 'lucide-react'
import { cn } from '../../lib/utils'

interface VoiceRecorderProps {
  onSend: (blob: Blob, durationSec: number) => void
  onCancel: () => void
}

const BAR_COUNT = 40

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(true)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0.1))
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const barTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimers = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)
    barTimerRef.current = setInterval(() => {
      setBars(Array.from({ length: BAR_COUNT }, () => 0.1 + Math.random() * 0.9))
    }, 150)
  }, [])

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (barTimerRef.current) clearInterval(barTimerRef.current)
  }, [])

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
      if (cancelled) {
        s.getTracks().forEach((t) => t.stop())
        return
      }
      stream = s
      const recorder = new MediaRecorder(s)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      startTimers()
    }).catch(() => {
      if (!cancelled) onCancel()
    })

    return () => {
      cancelled = true
      stopTimers()
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [onCancel, startTimers, stopTimers])

  const handlePauseResume = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (paused) {
      recorder.resume()
      startTimers()
    } else {
      recorder.pause()
      stopTimers()
    }
    setPaused(!paused)
  }

  const handleCancel = () => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stopTimers()
    setRecording(false)
    onCancel()
  }

  const handleSend = () => {
    const recorder = recorderRef.current
    if (!recorder) return

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onSend(blob, elapsed)
    }

    if (recorder.state !== 'inactive') recorder.stop()
    stopTimers()
    setRecording(false)
  }

  if (!recording) return null

  return (
    <div className="flex items-center gap-3 border-t border-gray-100 bg-white p-3">
      <button
        onClick={handleCancel}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <div className="flex h-6 flex-1 items-end gap-[2px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              'w-[3px] rounded-full bg-holio-orange transition-all',
              paused && 'opacity-40',
            )}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'h-2.5 w-2.5 rounded-full bg-red-500',
            !paused && 'animate-pulse-recording',
          )} />
          <span className="min-w-[40px] text-sm font-medium text-holio-text">
            {formatTime(elapsed)}
          </span>
        </div>

        <button
          onClick={handlePauseResume}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-50 hover:text-holio-text"
        >
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>

        <button
          onClick={handleSend}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-holio-orange text-white transition-colors hover:bg-holio-orange/90"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
