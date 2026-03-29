import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import api from '../services/api.service'
import { cn } from '../lib/utils'

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+47', flag: '🇳🇴', label: 'NO' },
  { code: '+46', flag: '🇸🇪', label: 'SE' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+86', flag: '🇨🇳', label: 'CN' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
]

interface FloatingFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoFocus?: boolean
}

function FloatingField({ label, value, onChange, type = 'text', autoFocus }: FloatingFieldProps) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div className="relative px-4 pt-5 pb-0">
      <label
        className={cn(
          'pointer-events-none absolute left-4 transition-all duration-200',
          active ? 'top-1 text-xs' : 'top-5 text-base',
          focused ? 'text-holio-orange' : 'text-holio-muted',
        )}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        className={cn(
          'w-full border-b bg-transparent pt-1 pb-2 text-base text-holio-text outline-none transition-colors',
          focused ? 'border-holio-orange' : 'border-gray-200',
        )}
      />
    </div>
  )
}

export default function NewContactPage() {
  const nav = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryIdx, setCountryIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const [phoneFocused, setPhoneFocused] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCountry = COUNTRY_CODES[countryIdx]
  const phoneActive = phoneFocused || phone.length > 0

  async function handleCreate(e?: FormEvent) {
    e?.preventDefault()
    if (!firstName.trim()) return
    setSaving(true)
    setErr('')
    try {
      const fullPhone = phone.trim()
        ? `${selectedCountry.code}${phone.replace(/\D/g, '')}`
        : null
      await api.post('/contacts', {
        contactUserId: fullPhone,
        nickname: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
        phone: phone.trim() || null,
      })
      nav(-1)
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErr(m ?? 'Failed to create contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-holio-offwhite">
      <header className="flex h-14 shrink-0 items-center justify-between bg-holio-offwhite px-4">
        <button
          onClick={() => nav(-1)}
          className="flex items-center text-holio-orange transition-opacity hover:opacity-80"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-holio-text">New Contact</h1>
        <button
          onClick={() => handleCreate()}
          disabled={saving || !firstName.trim()}
          className="text-base font-medium text-holio-orange transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Create'}
        </button>
      </header>

      <form onSubmit={handleCreate} className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white">
        <FloatingField
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoFocus
        />

        <FloatingField
          label="Last name"
          value={lastName}
          onChange={setLastName}
        />

        <div className="mx-4 mt-3 border-t border-gray-100" />

        <div className="relative px-4 pt-5 pb-4">
          <label
            className={cn(
              'pointer-events-none absolute left-4 transition-all duration-200',
              phoneActive ? 'top-1 text-xs' : 'top-5 text-base',
              phoneFocused ? 'text-holio-orange' : 'text-holio-muted',
            )}
          >
            Phone number
          </label>

          <div className="flex items-end gap-2">
            <div ref={dropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  'flex items-center gap-1 border-b pb-2 pt-1 text-base transition-colors',
                  phoneFocused ? 'border-holio-orange' : 'border-gray-200',
                )}
              >
                <span>{selectedCountry.flag}</span>
                <span className="text-holio-text">{selectedCountry.code}</span>
                <ChevronDown className="h-3.5 w-3.5 text-holio-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 max-h-52 w-44 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {COUNTRY_CODES.map((c, i) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountryIdx(i); setDropdownOpen(false) }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                        i === countryIdx && 'bg-holio-orange/10 text-holio-orange',
                      )}
                    >
                      <span>{c.flag}</span>
                      <span>{c.label}</span>
                      <span className="text-holio-muted">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              className={cn(
                'w-full border-b bg-transparent pt-1 pb-2 text-base text-holio-text outline-none transition-colors',
                phoneFocused ? 'border-holio-orange' : 'border-gray-200',
              )}
            />
          </div>
        </div>
      </form>

      {err && (
        <p className="mx-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          {err}
        </p>
      )}
    </div>
  )
}
