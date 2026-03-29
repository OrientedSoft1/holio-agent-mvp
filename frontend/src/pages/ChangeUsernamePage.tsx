import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X, Loader2, AtSign } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api.service'

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const MIN_LENGTH = 5
const MAX_LENGTH = 32

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function ChangeUsernamePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [username, setUsername] = useState(user?.username ?? '')
  const [status, setStatus] = useState<AvailabilityStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [validationMsg, setValidationMsg] = useState('')

  const validate = useCallback((value: string): boolean => {
    if (!value) {
      setValidationMsg('')
      setStatus('idle')
      return false
    }
    if (value.length < MIN_LENGTH) {
      setValidationMsg(`Username must be at least ${MIN_LENGTH} characters`)
      setStatus('invalid')
      return false
    }
    if (value.length > MAX_LENGTH) {
      setValidationMsg(`Username must be at most ${MAX_LENGTH} characters`)
      setStatus('invalid')
      return false
    }
    if (!USERNAME_REGEX.test(value)) {
      setValidationMsg('Only letters, numbers, and underscores allowed')
      setStatus('invalid')
      return false
    }
    setValidationMsg('')
    return true
  }, [])

  useEffect(() => {
    if (!validate(username)) return
    if (username === user?.username) {
      setStatus('idle')
      return
    }

    setStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/check-username/${encodeURIComponent(username)}`)
        setStatus(data.available ? 'available' : 'taken')
        if (!data.available) setValidationMsg('This username is already taken')
      } catch {
        setStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, user?.username, validate])

  function handleChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (cleaned.length <= MAX_LENGTH) {
      setUsername(cleaned)
      setError('')
    }
  }

  async function handleSave() {
    if (!validate(username) || status === 'taken' || status === 'checking') return
    if (username === user?.username) {
      navigate('/edit-profile')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data } = await api.patch('/users/me', { username })
      if (user) {
        setAuth(
          { ...user, ...data },
          useAuthStore.getState().accessToken!,
          useAuthStore.getState().refreshToken!,
        )
      }
      navigate('/edit-profile')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setError(msg ?? 'Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    username.length >= MIN_LENGTH &&
    status === 'available' &&
    !saving

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/edit-profile')}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-holio-text">Username</h1>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="text-sm font-semibold text-holio-orange disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Done'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Current Username
        </p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-holio-orange/10">
              <AtSign className="h-5 w-5 text-holio-orange" />
            </div>
            <p className="text-sm font-medium text-holio-text">
              {user?.username ? `@${user.username}` : 'No username set'}
            </p>
          </div>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          New Username
        </p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <span className="text-base text-holio-muted">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="username"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-base text-holio-text outline-none placeholder:text-holio-muted"
            />
            <div className="flex h-5 w-5 items-center justify-center">
              {status === 'checking' && (
                <Loader2 className="h-4 w-4 animate-spin text-holio-muted" />
              )}
              {status === 'available' && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {(status === 'taken' || status === 'invalid') && username.length > 0 && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {validationMsg && (
            <p className="mt-2 text-xs text-red-500">{validationMsg}</p>
          )}
          {status === 'available' && (
            <p className="mt-2 text-xs text-green-600">Username is available</p>
          )}
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
          Guidelines
        </p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          <ul className="space-y-2 text-sm text-holio-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-holio-muted" />
              Usernames must be {MIN_LENGTH}–{MAX_LENGTH} characters long
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-holio-muted" />
              Only letters (a-z), numbers (0-9), and underscores (_) are allowed
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-holio-muted" />
              Usernames are not case-sensitive
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-holio-muted" />
              You can share your username so others can find you easily
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
