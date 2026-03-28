interface DateSeparatorProps {
  label: string
}

export default function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-holio-muted shadow-sm">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}
