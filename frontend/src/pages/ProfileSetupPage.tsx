import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User } from 'lucide-react'
import api from '../services/api.service'
import { useAuthStore } from '../stores/authStore'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) return

    setLoading(true)
    setError('')

    try {
      let avatarUrl: string | null = null

      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const uploadRes = await api.post('/uploads/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        avatarUrl = uploadRes.data.url
      }

      const { data } = await api.patch('/users/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        ...(avatarUrl && { avatarUrl }),
      })

      if (user) {
        setAuth(
          { ...user, ...data },
          useAuthStore.getState().accessToken!,
          useAuthStore.getState().refreshToken!,
        )
      }

      navigate('/select-company', { replace: true })
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-holio-offwhite px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-1 text-center text-3xl font-black tracking-tight text-holio-dark">
          HOLIO
        </h1>
        <p className="mb-8 text-center text-sm text-holio-muted">
          Set up your profile
        </p>

        <form onSubmit={handleSubmit}>
          {/* Avatar upload */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="absolute inset-0 m-auto h-10 w-10 text-gray-400" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-holio-text">
              First name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-holio-text">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name (optional)"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !firstName.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Start Messaging'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
