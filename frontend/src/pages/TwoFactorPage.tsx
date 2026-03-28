import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import api from '../services/api.service'
import { useAuthStore } from '../stores/authStore'

export default function TwoFactorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { tempToken } = (location.state as { tempToken?: string }) ?? {}

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!tempToken) {
    navigate('/login', { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/verify-2fa', {
        tempToken,
        password: password.trim(),
      })
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/select-company', { replace: true })
    } catch {
      setError('Incorrect password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-holio-offwhite px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-holio-muted transition-colors hover:text-holio-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-holio-lavender">
            <ShieldCheck className="h-8 w-8 text-holio-dark" />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-holio-text">
          Two-Step Verification
        </h1>
        <p className="mb-8 text-center text-sm text-holio-muted">
          Enter your cloud password
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-12 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-holio-muted transition-colors hover:text-holio-text"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Next'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
