interface GifMessageProps {
  fileUrl: string
  caption?: string
  isMine: boolean
}

export default function GifMessage({ fileUrl, caption, isMine }: GifMessageProps) {
  return (
    <div>
      <div className="relative max-w-[300px] overflow-hidden rounded-xl">
        <img
          src={fileUrl}
          alt={caption ?? 'GIF'}
          className="w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          GIF
        </span>
      </div>
      {caption && (
        <p className={`mt-1 text-sm ${isMine ? 'text-white' : 'text-holio-text'}`}>
          {caption}
        </p>
      )}
    </div>
  )
}
