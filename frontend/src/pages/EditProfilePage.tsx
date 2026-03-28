import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Camera, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api.service'
import { cn } from '../lib/utils'

const BIO_MAX = 70

export default function EditProfilePage() {
  const nav = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const fRef = useRef<HTMLInputElement>(null)
  const [fn, setFn] = useState(user?.firstName ?? '')
  const [ln, setLn] = useState(user?.lastName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [un, setUn] = useState(user?.username ?? '')
  const [prev, setPrev] = useState<string | null>(user?.avatarUrl ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (!f) return; setFile(f); const r = new FileReader(); r.onload = (ev) => setPrev(ev.target?.result as string); r.readAsDataURL(f) }

  async function save(e: FormEvent) {
    e.preventDefault(); if (!fn.trim()) return; setSaving(true); setErr('')
    try {
      let url: string | undefined
      if (file) { const fd = new FormData(); fd.append('file', file); const r = await api.post('/uploads/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); url = r.data.url }
      const { data } = await api.patch('/users/me', { firstName: fn.trim(), lastName: ln.trim() || null, bio: bio.trim() || null, username: un.trim() || null, ...(url && { avatarUrl: url }) })
      if (user) setAuth({ ...user, ...data }, useAuthStore.getState().accessToken!, useAuthStore.getState().refreshToken!)
      nav(-1)
    } catch (e: unknown) { const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message; setErr(m ?? 'Failed to save changes') } finally { setSaving(false) }
  }

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3"><button onClick={() => nav(-1)} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></button><h1 className="text-lg font-bold text-holio-text">Edit Profile</h1></div>
        <button onClick={save} disabled={saving || !fn.trim()} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-orange transition-colors hover:bg-holio-orange/10 disabled:opacity-50">{saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" /> : <Check className="h-5 w-5" />}</button>
      </header>
      <form onSubmit={save} className="mx-auto w-full max-w-lg flex-1 p-6">
        <div className="mb-8 flex justify-center"><button type="button" onClick={() => fRef.current?.click()} className="group relative h-[120px] w-[120px] overflow-hidden rounded-full bg-gray-100">{prev ? <img src={prev} alt="Avatar" className="h-full w-full object-cover" /> : <User className="absolute inset-0 m-auto h-12 w-12 text-gray-400" />}<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"><Camera className="h-8 w-8 text-white" /></div></button><input ref={fRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" /></div>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-holio-text">First Name <span className="text-red-400">*</span></label><input type="text" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="First Name" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange" autoFocus /></div>
          <div><label className="mb-1 block text-sm font-medium text-holio-text">Last Name</label><input type="text" value={ln} onChange={(e) => setLn(e.target.value)} placeholder="Last Name" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange" /></div>
          <div><div className="mb-1 flex items-center justify-between"><label className="text-sm font-medium text-holio-text">Bio</label><span className={cn('text-xs', bio.length >= BIO_MAX ? 'text-red-400' : 'text-holio-muted')}>{bio.length}/{BIO_MAX}</span></div><textarea value={bio} onChange={(e) => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value) }} placeholder="Write something about yourself..." rows={3} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange" /></div>
          <div><label className="mb-1 block text-sm font-medium text-holio-text">Username</label><div className="flex h-12 items-center rounded-xl border border-gray-200 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-holio-orange"><span className="pl-4 text-holio-muted">@</span><input type="text" value={un} onChange={(e) => setUn(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder="username" className="h-full flex-1 bg-transparent px-1 text-holio-text outline-none placeholder:text-holio-muted" /></div></div>
        </div>
        {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{err}</p>}
      </form>
    </div>
  )
}
