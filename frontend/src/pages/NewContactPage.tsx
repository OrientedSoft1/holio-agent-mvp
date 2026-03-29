import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import api from '../services/api.service'
import { cn } from '../lib/utils'
import { COUNTRY_CODES } from '../lib/countryCodes'

export default function NewContactPage() {
  const nav = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+47')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const isValid = firstName.trim().length > 0

  async function handleCreate(e?: FormEvent) {
    e?.preventDefault()
    if (!isValid || saving) return
    setSaving(true)
    setErr('')
    try {
      const fullPhone = phone.trim() ? `${countryCode}${phone.trim()}` : null
      await api.post('/contacts', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        phone: fullPhone,
      })
      nav('/contacts')
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErr(m ?? 'Failed to create contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-holio-offwhite">
      <header className="flex h-14 flex-shrink-0 items-center justify-between bg-holio-offwhite px-4">
        <button
          type="button"
          onClick={() => nav('/contacts')}
          className="flex items-center text-holio-orange transition-colors hover:opacity-80"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-semibold text-holio-text">New Contact</h1>

        <button
          type="button"
          onClick={() => handleCreate()}
          disabled={!isValid || saving}
          className="text-base font-semibold text-holio-orange transition-colors hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Creating…' : 'Create'}
        </button>
      </header>

      <form onSubmit={handleCreate} className="mx-4 mt-3 rounded-2xl bg-white p-4">
        <div className="space-y-4">
          {/* First name */}
          <div>
            <label
              className={cn(
                'block text-xs font-medium transition-colors',
                focused === 'firstName' ? 'text-holio-orange' : 'text-holio-muted',
              )}
            >
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setFocused('firstName')}
              onBlur={() => setFocused(null)}
              className={cn(
                'w-full border-b bg-transparent py-2 text-base text-holio-text outline-none transition-colors placeholder:text-holio-muted',
                focused === 'firstName' ? 'border-holio-orange' : 'border-gray-200',
              )}
              autoFocus
            />
          </div>

          {/* Last name */}
          <div>
            <label
              className={cn(
                'block text-xs font-medium transition-colors',
                focused === 'lastName' ? 'text-holio-orange' : 'text-holio-muted',
              )}
            >
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => setFocused('lastName')}
              onBlur={() => setFocused(null)}
              className={cn(
                'w-full border-b bg-transparent py-2 text-base text-holio-text outline-none transition-colors placeholder:text-holio-muted',
                focused === 'lastName' ? 'border-holio-orange' : 'border-gray-200',
              )}
            />
          </div>
        </div>

        <div className="my-4 border-t border-gray-100" />

        {/* Phone number */}
        <div>
          <label
            className={cn(
              'block text-xs font-medium transition-colors',
              focused === 'phone' ? 'text-holio-orange' : 'text-holio-muted',
            )}
          >
            Phone number
          </label>
          <div
            className={cn(
              'flex items-center border-b transition-colors',
              focused === 'phone' ? 'border-holio-orange' : 'border-gray-200',
            )}
          >
            <div className="relative flex shrink-0 items-center">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                className="appearance-none bg-transparent py-2 pr-5 text-base text-holio-text outline-none"
              >
                {COUNTRY_CODES.map(({ code, country, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code} {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-holio-muted" />
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              placeholder="Phone number"
              className="w-full bg-transparent py-2 pl-2 text-base text-holio-text outline-none placeholder:text-holio-muted"
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
