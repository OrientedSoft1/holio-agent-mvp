import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowRight, ChevronDown } from 'lucide-react'
import api from '../services/api.service'
import { COUNTRY_CODES } from '../lib/countryCodes'

export default function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find((c) => c.country === 'NO') ?? COUNTRY_CODES[0],
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/send-code', {
        phone: phone.trim(),
        countryCode: selectedCountry.code,
      })
      navigate('/verify', {
        state: { phone: phone.trim(), countryCode: selectedCountry.code },
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Failed to send code. Try again.')
      setError(msg)
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
          Corporate Messaging Platform
        </p>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-holio-text">
            Phone Number
          </label>

          <div className="mb-4 flex gap-2">
            {/* Country code dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-12 items-center gap-1 rounded-xl border border-gray-200 px-3 text-sm transition-colors hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="font-medium text-holio-text">
                  {selectedCountry.code}
                </span>
                <ChevronDown className="h-4 w-4 text-holio-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 max-h-60 w-48 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c)
                        setDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-holio-offwhite"
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span className="text-holio-muted">{c.country}</span>
                      <span className="ml-auto font-medium text-holio-text">
                        {c.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone input */}
            <div className="relative flex-1">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-holio-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="h-12 w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
