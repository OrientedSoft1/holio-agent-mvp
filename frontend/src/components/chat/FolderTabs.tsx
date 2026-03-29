import { useState, useEffect, useRef } from 'react'
import { Plus, X, Trash2, Pencil, Check } from 'lucide-react'
import { useFolderStore, type Folder } from '../../stores/folderStore'
import { cn } from '../../lib/utils'

type FilterKey = 'contacts' | 'groups' | 'channels' | 'bots'

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'groups', label: 'Groups' },
  { key: 'channels', label: 'Channels' },
  { key: 'bots', label: 'Bots' },
]

export default function FolderTabs() {
  const folders = useFolderStore((s) => s.folders)
  const activeFolder = useFolderStore((s) => s.activeFolder)
  const setActiveFolder = useFolderStore((s) => s.setActiveFolder)
  const addFolder = useFolderStore((s) => s.addFolder)
  const updateFolder = useFolderStore((s) => s.updateFolder)
  const removeFolder = useFolderStore((s) => s.removeFolder)
  const fetchFolders = useFolderStore((s) => s.fetchFolders)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFilters, setNewFilters] = useState<Record<FilterKey, boolean>>({
    contacts: false,
    groups: false,
    channels: false,
    bots: false,
  })

  const [contextId, setContextId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const contextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextId(null)
      }
    }
    if (contextId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextId])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const filters: Record<string, boolean> = {}
    for (const [key, val] of Object.entries(newFilters)) {
      if (val) filters[key] = true
    }
    await addFolder(newName.trim(), filters)
    setNewName('')
    setNewFilters({ contacts: false, groups: false, channels: false, bots: false })
    setShowCreate(false)
  }

  const handleContextMenu = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault()
    if (folder.isDefault) return
    setContextId(contextId === folder.id ? null : folder.id)
  }

  const handleDelete = async (folderId: string) => {
    await removeFolder(folderId)
    setContextId(null)
  }

  const startEdit = (folder: Folder) => {
    setEditingId(folder.id)
    setEditName(folder.name)
    setContextId(null)
  }

  const handleEditSave = async () => {
    if (!editingId || !editName.trim()) return
    await updateFolder(editingId, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="relative flex items-center gap-1 overflow-x-auto px-3 pb-2 scrollbar-hide">
      {folders.map((folder) => (
        <div key={folder.id} className="relative flex-shrink-0">
          {editingId === folder.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave()
                  if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                }}
                className="w-24 rounded-full border border-holio-orange px-3 py-1 text-sm text-holio-text outline-none"
                autoFocus
              />
              <button
                onClick={handleEditSave}
                disabled={!editName.trim()}
                className="rounded-full p-1 text-holio-orange hover:bg-holio-orange/10 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveFolder(folder.id)}
              onContextMenu={(e) => handleContextMenu(e, folder)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeFolder === folder.id
                  ? 'bg-holio-orange text-white'
                  : 'text-holio-muted hover:bg-gray-100',
              )}
            >
              {folder.name}
            </button>
          )}
          {contextId === folder.id && (
            <div
              ref={contextRef}
              className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
            >
              <button
                onClick={() => startEdit(folder)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-holio-text hover:bg-gray-50"
              >
                <Pencil className="h-3 w-3" />
                Rename folder
              </button>
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
        <div className="flex flex-shrink-0 flex-col gap-2">
          <div className="flex items-center gap-1">
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
          <div className="flex flex-wrap gap-1 pl-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setNewFilters((p) => ({ ...p, [opt.key]: !p[opt.key] }))}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                  newFilters[opt.key]
                    ? 'bg-holio-orange/15 text-holio-orange'
                    : 'bg-gray-100 text-holio-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
