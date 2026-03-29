import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import api from '../services/api.service'

const COUNTRY_CODES = [
  { code: '+1', label: 'US / CA' },
  { code: '+44', label: 'UK' },
  { code: '+47', label: 'NO' },
  { code: '+46', label: 'SE' },
  { code: '+45', label: 'DK' },
  { code: '+49', label: 'DE' },
  { code: '+33', label: 'FR' },
  { code: '+34', label: 'ES' },
  { code: '+39', label: 'IT' },
  { code: '+61', label: 'AU' },
  { code: '+81', label: 'JP' },
  { code: '+82', label: 'KR' },
  { code: '+91', label: 'IN' },
  { code: '+86', label: 'CN' },
  { code: '+55', label: 'BR' },
]

type Step = 'input' | 'verify'

export default function ChangePhonePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<Step>('input')
  const [countryCode, setCountryCode] = useState('+47')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullNewNumber = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`

  async function handleSendCode() {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/change-phone/request', { phone: fullNewNumber })
      setStep('verify')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send verification code'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (verificationCode.length < 4) {
      setError('Please enter the verification code')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/change-phone/verify', {
        phone: fullNewNumber,
        code: verificationCode,
      })
      navigate('/edit-profile')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid verification code'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() =>
            step === 'verify' ? setStep('input') : navigate('/edit-profile')
          }
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">
          Change Phone Number
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Current number */}
        <SectionLabel>Current Number</SectionLabel>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-holio-text">
            {user?.phone || 'No phone number set'}
          </p>
        </div>

        {step === 'input' ? (
          <>
            {/* Warning */}
            <div className="mx-4 mt-4 flex gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Before you change your number</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li>Your account and all data will be migrated to the new number</li>
                  <li>Your contacts will see your new number</li>
                  <li>Active sessions on other devices will be logged out</li>
                </ul>
              </div>
            </div>

            {/* New number input */}
            <SectionLabel>New Phone Number</SectionLabel>
            <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-holio-offwhite dark:bg-gray-800 px-3 text-sm text-holio-text outline-none focus:border-holio-orange"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    setError(null)
                  }}
                  className="h-11 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-holio-offwhite dark:bg-gray-800 px-4 text-sm text-holio-text placeholder:text-holio-muted outline-none focus:border-holio-orange"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}

              <button
                onClick={handleSendCode}
                disabled={loading || !phoneNumber.trim()}
                className={cn(
                  'mt-4 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors',
                  loading || !phoneNumber.trim()
                    ? 'bg-holio-orange/50 cursor-not-allowed'
                    : 'bg-holio-orange hover:bg-holio-orange/90 active:bg-holio-orange/80',
                )}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Verification step */}
            <SectionLabel>Verification</SectionLabel>
            <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
              <p className="mb-3 text-xs text-holio-muted">
                We sent a verification code to{' '}
                <span className="font-medium text-holio-text">
                  {fullNewNumber}
                </span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, ''))
                  setError(null)
                }}
                className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-holio-offwhite dark:bg-gray-800 px-4 text-center text-lg tracking-[0.3em] text-holio-text placeholder:text-holio-muted placeholder:tracking-normal placeholder:text-sm outline-none focus:border-holio-orange"
              />

              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || verificationCode.length < 4}
                className={cn(
                  'mt-4 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors',
                  loading || verificationCode.length < 4
                    ? 'bg-holio-orange/50 cursor-not-allowed'
                    : 'bg-holio-orange hover:bg-holio-orange/90 active:bg-holio-orange/80',
                )}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Confirm Change'
                )}
              </button>

              <button
                onClick={() => {
                  setStep('input')
                  setVerificationCode('')
                  setError(null)
                }}
                className="mt-2 w-full py-2 text-sm text-holio-muted hover:text-holio-text transition-colors"
              >
                Use a different number
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">
      {children}
    </p>
  )
}
