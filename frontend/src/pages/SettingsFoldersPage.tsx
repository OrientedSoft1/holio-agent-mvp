import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FolderOpen, Plus, Pencil, Trash2, Lock } from 'lucide-react'
import { useFolderStore, type Folder } from '../stores/folderStore'
import { cn } from '../lib/utils'

const FILTER_OPTIONS = [
  { key: 'contacts' as const, label: 'Contacts' },
  { key: 'nonContacts' as const, label: 'Non-Contacts' },
  { key: 'groups' as const, label: 'Groups' },
  { key: 'channels' as const, label: 'Channels' },
  { key: 'bots' as const, label: 'Bots' },
]

export default function SettingsFoldersPage() {
  const navigate = useNavigate()
  const { folders, fetchFolders, addFolder, updateFolder, removeFolder, loading } = useFolderStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [name, setName] = useState('')
  const [filters, setFilters] = useState<Folder['filters']>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { fetchFolders() }, [fetchFolders])

  const defaultFolders = folders.filter((f) => f.isDefault)
  const customFolders = folders.filter((f) => !f.isDefault)

  const openCreate = () => {
    setEditingFolder(null)
    setName('')
    setFilters({})
    setDialogOpen(true)
  }

  const openEdit = (folder: Folder) => {
    setEditingFolder(folder)
    setName(folder.name)
    setFilters({ ...folder.filters })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editingFolder) {
      await updateFolder(editingFolder.id, { name: name.trim(), filters })
    } else {
      await addFolder(name.trim(), filters)
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await removeFolder(id)
    setDeleteConfirm(null)
  }

  const toggleFilter = (key: keyof Folder['filters']) => {
    setFilters((f) => ({ ...f, [key]: !f[key] }))
  }

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-holio-text" />
          </button>
          <h1 className="text-lg font-semibold text-holio-text">Chat Folders</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1 text-sm font-medium text-[#FF9220]">
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF9220] border-t-transparent" />
          </div>
        )}

        <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Default Folders</p>
        <div className="mx-4 rounded-2xl bg-white">
          {defaultFolders.map((folder, i) => (
            <div key={folder.id}>
              {i > 0 && <div className="mx-4 border-t border-gray-100" />}
              <div className="flex items-center gap-3 px-4 py-3">
                <FolderOpen className="h-5 w-5 text-holio-muted" />
                <span className="flex-1 text-sm text-holio-text">{folder.name}</span>
                <Lock className="h-4 w-4 text-holio-muted/50" />
              </div>
            </div>
          ))}
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Custom Folders</p>
        {customFolders.length === 0 ? (
          <div className="mx-4 rounded-2xl bg-white px-4 py-8 text-center">
            <FolderOpen className="mx-auto mb-2 h-10 w-10 text-holio-muted/30" />
            <p className="text-sm text-holio-muted">No custom folders yet</p>
            <button onClick={openCreate} className="mt-3 text-sm font-medium text-[#FF9220]">Create one</button>
          </div>
        ) : (
          <div className="mx-4 rounded-2xl bg-white">
            {customFolders.map((folder, i) => (
              <div key={folder.id}>
                {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <FolderOpen className="h-5 w-5 text-[#FF9220]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-holio-text">{folder.name}</p>
                    <p className="truncate text-xs text-holio-muted">
                      {Object.entries(folder.filters).filter(([, v]) => v).map(([k]) => k).join(', ') || 'No filters'}
                    </p>
                  </div>
                  <button onClick={() => openEdit(folder)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                    <Pencil className="h-3.5 w-3.5 text-holio-muted" />
                  </button>
                  <button onClick={() => setDeleteConfirm(folder.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 text-base font-semibold text-holio-text">
              {editingFolder ? 'Edit Folder' : 'New Folder'}
            </h4>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text outline-none focus:ring-2 focus:ring-[#FF9220]"
              autoFocus
            />
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-holio-muted">Include</p>
            <div className="mb-5 space-y-2">
              {FILTER_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex cursor-pointer items-center gap-3" onClick={() => toggleFilter(opt.key)}>
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded border-2', filters[opt.key] ? 'border-[#FF9220] bg-[#FF9220]' : 'border-gray-300')}>
                    {filters[opt.key] && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm text-holio-text">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-holio-text hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="flex-1 rounded-xl bg-[#FF9220] py-2.5 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-2 text-base font-semibold text-holio-text">Delete Folder?</h4>
            <p className="mb-5 text-sm text-holio-muted">This folder will be permanently removed. Chats won't be deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-holio-text hover:bg-gray-200">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
