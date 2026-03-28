import { Plus } from 'lucide-react'
import { useFolderStore } from '../../stores/folderStore'
import { cn } from '../../lib/utils'

export default function FolderTabs() {
  const folders = useFolderStore((s) => s.folders)
  const activeFolder = useFolderStore((s) => s.activeFolder)
  const setActiveFolder = useFolderStore((s) => s.setActiveFolder)

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => setActiveFolder(folder.id)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            activeFolder === folder.id
              ? 'bg-holio-orange text-white'
              : 'text-holio-muted hover:bg-gray-100',
          )}
        >
          {folder.name}
        </button>
      ))}
      <button
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
        title="Add folder"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
