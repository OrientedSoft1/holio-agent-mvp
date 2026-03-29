import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  Paperclip,
  Smile,
  Type,
  SlidersHorizontal,
  ChevronRight,
  Clock,
} from 'lucide-react'

interface LinkPreviewData {
  title: string
  description: string
  domain: string
  image?: string
}

export default function StoryPage() {
  const navigate = useNavigate()
  const [caption, setCaption] = useState('')

  const samplePreview: LinkPreviewData = {
    title: 'Understanding Modern AI Agents',
    description:
      'A deep dive into how AI agents are transforming enterprise workflows and team collaboration.',
    domain: 'blog.holio.ai',
    image: 'https://picsum.photos/seed/story/120/80',
  }

  return (
    <div className="flex h-screen flex-col bg-holio-dark">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">New Story</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
          <Bookmark className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Content area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-holio-orange">
            #general-updates
          </p>
          <p className="mb-4 text-[15px] leading-relaxed text-holio-text">
            We just shipped the new AI agent dashboard — check out how it
            simplifies your daily workflow and keeps the whole team in sync.
          </p>

          {/* Link preview */}
          <a
            href="#"
            className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            {samplePreview.image && (
              <img
                src={samplePreview.image}
                alt=""
                className="h-[72px] w-[72px] flex-shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="truncate text-sm font-semibold text-holio-text">
                {samplePreview.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-holio-muted">
                {samplePreview.description}
              </p>
              <p className="mt-1 text-xs text-holio-muted">
                {samplePreview.domain}
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Caption input */}
      <div className="flex-shrink-0 px-4 pb-2">
        <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
          />
          <Clock className="h-5 w-5 flex-shrink-0 text-white/50" />
          <span className="text-xs text-white/50">24h</span>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between px-4 pb-6 pt-2">
        <div className="flex items-center gap-1">
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
            <Paperclip className="h-5 w-5 text-white" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
            <Smile className="h-5 w-5 text-white" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
            <Type className="h-5 w-5 text-white" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10">
            <SlidersHorizontal className="h-5 w-5 text-white" />
          </button>
        </div>

        <button className="flex items-center gap-1.5 rounded-full bg-holio-orange px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-holio-orange/90">
          NEXT
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
