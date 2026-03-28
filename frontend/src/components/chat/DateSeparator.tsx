interface DateSeparatorProps {
  label: string
}

export default function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <span className="rounded-full bg-[rgba(114,131,145,0.4)] px-3 py-1 text-[13px] font-medium text-white shadow-sm">
        {label}
      </span>
    </div>
  )
}
