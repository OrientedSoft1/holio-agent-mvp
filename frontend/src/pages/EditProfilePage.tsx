import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api.service'

const BIO_MAX = 70

export default function EditProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)
  const fileRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [preview, setPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSave(e?: FormEvent) {
    e?.preventDefault()
    if (!firstName.trim()) return
    setSaving(true)
    setError('')

    try {
      let avatarUrl: string | undefined
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/uploads/avatar', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        avatarUrl = res.data.url
      }

      const { data } = await api.patch('/users/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        bio: bio.trim() || null,
        ...(avatarUrl && { avatarUrl }),
      })

      if (user) {
        setAuth(
          { ...user, ...data },
          useAuthStore.getState().accessToken!,
          useAuthStore.getState().refreshToken!,
        )
      }
      navigate(-1)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setError(msg ?? 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm">
        <h1 className="text-lg font-semibold text-holio-text">Edit Profile</h1>
        <button
          onClick={() => handleSave()}
          disabled={saving || !firstName.trim()}
          className="text-[15px] font-semibold text-holio-orange disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Done'}
        </button>
      </header>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
        {/* Avatar section */}
        <div className="flex flex-col items-center pb-5 pt-8">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative h-[100px] w-[100px] overflow-hidden rounded-full bg-gray-100 ring-2 ring-white shadow-md"
          >
            {preview ? (
              <img
                src={preview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="absolute inset-0 m-auto h-12 w-12 text-gray-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 text-sm font-medium text-holio-orange active:opacity-70"
          >
            Add New Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            className="hidden"
          />
        </div>

        {/* Name + Bio card */}
        <div className="mx-4 rounded-2xl bg-white shadow-sm">
          <div className="flex">
            <div className="flex-1 border-b border-gray-100 px-4 pb-2 pt-3">
              <label className="block text-xs font-medium text-holio-muted">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[15px] text-holio-text outline-none placeholder:text-gray-300"
                placeholder="First name"
                autoFocus
              />
            </div>
            <div className="my-3 w-px bg-gray-100" />
            <div className="flex-1 border-b border-gray-100 px-4 pb-2 pt-3">
              <label className="block text-xs font-medium text-holio-muted">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[15px] text-holio-text outline-none placeholder:text-gray-300"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="border-b border-gray-100 px-4 pb-2 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-holio-muted">Bio</label>
              <span className="text-xs tabular-nums text-holio-muted">
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= BIO_MAX) setBio(e.target.value)
              }}
              rows={2}
              className="mt-0.5 w-full resize-none bg-transparent text-[15px] text-holio-text outline-none placeholder:text-gray-300"
              placeholder="Write something about yourself"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-2 pt-3">
            <div className="min-w-0 flex-1">
              <label className="block text-xs font-medium text-holio-muted">Phone</label>
              <p className="mt-0.5 truncate text-[15px] text-holio-text">
                {user?.phone ?? '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/change-phone')}
              className="ml-4 flex-shrink-0 text-sm font-medium text-holio-orange active:opacity-70"
            >
              Change
            </button>
          </div>

          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <div className="min-w-0 flex-1">
              <label className="block text-xs font-medium text-holio-muted">Username</label>
              <p className="mt-0.5 truncate text-[15px] text-holio-text">
                {user?.username ? `@${user.username}` : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/change-username')}
              className="ml-4 flex-shrink-0 text-sm font-medium text-holio-orange active:opacity-70"
            >
              Change
            </button>
          </div>
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-center pb-10 pt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="text-[15px] font-medium text-red-500 active:opacity-70"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  )
}
