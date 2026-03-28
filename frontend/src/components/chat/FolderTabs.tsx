import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { useFolderStore, type Folder } from '../../stores/folderStore'
import { cn } from '../../lib/utils'

export default function FolderTabs() {
  const folders = useFolderStore((s) => s.folders)
  const activeFolder = useFolderStore((s) => s.activeFolder)
  const setActiveFolder = useFolderStore((s) => s.setActiveFolder)
  const addFolder = useFolderStore((s) => s.addFolder)
  const removeFolder = useFolderStore((s) => s.removeFolder)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [contextId, setContextId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    const id = `custom-${Date.now()}`
    addFolder({
      id,
      name: newName.trim(),
      filters: {},
    })
    setNewName('')
    setShowCreate(false)
    setActiveFolder(id)
  }

  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    if (['all', 'personal', 'work', 'bots'].includes(folderId)) return
    setContextId(contextId === folderId ? null : folderId)
  }

  const handleDelete = (folderId: string) => {
    removeFolder(folderId)
    setContextId(null)
  }

  return (
    <div className="relative flex items-center gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
      {folders.map((folder) => (
        <div key={folder.id} className="relative flex-shrink-0">
          <button
            onClick={() => setActiveFolder(folder.id)}
            onContextMenu={(e) => handleContextMenu(e, folder.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeFolder === folder.id
                ? 'bg-holio-orange text-white'
                : 'text-holio-muted hover:bg-gray-100',
            )}
          >
            {folder.name}
          </button>
          {contextId === folder.id && (
            <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              <button
                onClick={() => handleDelete(folder.id)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                Delete folder
              </button>
            </div>
          )}
        </div>
      ))}

      {showCreate ? (
        <div className="flex flex-shrink-0 items-center gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setShowCreate(false); setNewName('') }
            }}
            placeholder="Folder name"
            className="w-28 rounded-full border border-gray-200 px-3 py-1 text-sm text-holio-text outline-none focus:border-holio-orange"
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="rounded-full bg-holio-orange px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewName('') }}
            className="text-holio-muted hover:text-holio-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-holio-muted transition-colors hover:bg-gray-100"
          title="Add folder"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
