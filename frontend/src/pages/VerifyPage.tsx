import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api.service'
import { useAuthStore } from '../stores/authStore'

const CODE_LENGTH = 5
const RESEND_SECONDS = 59

export default function VerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { phone, countryCode } = (location.state as { phone?: string; countryCode?: string }) ?? {}

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true })
    }
  }, [phone, navigate])

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const submitCode = useCallback(
    async (code: string) => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.post('/auth/verify-code', {
          phone,
          countryCode,
          code,
        })

        if (data.isNewUser) {
          navigate('/profile-setup', { state: { tempToken: data.tempToken } })
        } else if (data.requires2fa) {
          navigate('/2fa', { state: { tempToken: data.tempToken } })
        } else {
          setAuth(data.user, data.accessToken, data.refreshToken)
          navigate('/select-company', { replace: true })
        }
      } catch {
        setError('Invalid code. Please try again.')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      } finally {
        setLoading(false)
      }
    },
    [phone, countryCode, navigate, setAuth],
  )

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === CODE_LENGTH - 1) {
      const code = next.join('')
      if (code.length === CODE_LENGTH) {
        submitCode(code)
      }
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((char, i) => {
      next[i] = char
    })
    setDigits(next)

    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  async function handleResend() {
    try {
      await api.post('/auth/send-code', { phone, countryCode })
      setResendTimer(RESEND_SECONDS)
      setError('')
    } catch {
      setError('Failed to resend code.')
    }
  }

  if (!phone) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-holio-offwhite px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-1 text-sm text-holio-muted transition-colors hover:text-holio-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-1 text-center text-3xl font-black tracking-tight text-holio-dark">
          HOLIO
        </h1>
        <p className="mb-2 text-center text-sm text-holio-muted">
          Enter the code we sent to
        </p>
        <p className="mb-8 text-center text-sm font-medium text-holio-text">
          {countryCode} {phone}
        </p>

        <div className="mb-6 flex justify-center gap-3" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="h-14 w-12 rounded-xl border border-gray-200 text-center text-xl font-bold text-holio-text transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange disabled:opacity-50"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {loading && (
          <div className="mb-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
          </div>
        )}

        <p className="text-center text-sm text-holio-muted">
          {resendTimer > 0 ? (
            <>Resend code in {resendTimer}s</>
          ) : (
            <button
              onClick={handleResend}
              className="font-medium text-holio-orange transition-colors hover:text-orange-600"
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
