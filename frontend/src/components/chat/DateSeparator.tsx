interface DateSeparatorProps {
  label: string
}

export default function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-3">
      <span className="rounded-full bg-white/80 px-4 py-1 text-xs font-medium text-[#8E8E93] shadow-sm backdrop-blur-sm">
        {label}
      </span>
    </div>
  )
}