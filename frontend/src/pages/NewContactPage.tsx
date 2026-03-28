import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import api from '../services/api.service'
import { cn } from '../lib/utils'

export default function NewContactPage() {
  const nav = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) return
    setSaving(true)
    setErr('')
    try {
      await api.post('/contacts', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
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
      <header className="flex h-14 flex-shrink-0 items-center justify-between bg-holio-offwhite px-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-1 text-holio-orange transition-colors hover:opacity-80">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-holio-text">New Contact</h1>
        <button
          onClick={handleCreate}
          disabled={saving || !firstName.trim()}
          className="text-base font-medium text-holio-orange transition-colors hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Create'}
        </button>
      </header>

      <form onSubmit={handleCreate} className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white">
        {/* First name */}
        <div className="px-4 pt-4 pb-0">
          <label className={cn('block text-xs transition-colors', focused === 'firstName' ? 'text-holio-orange' : 'text-holio-muted')}>
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
        <div className="px-4 pt-3 pb-0">
          <label className={cn('block text-xs transition-colors', focused === 'lastName' ? 'text-holio-orange' : 'text-holio-muted')}>
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

        <div className="mx-4 my-3 border-t border-gray-100" />

        {/* Phone number */}
        <div className="px-4 pt-0 pb-4">
          <label className={cn('block text-xs transition-colors', focused === 'phone' ? 'text-holio-orange' : 'text-holio-muted')}>
            Phone number
          </label>
          <div className="flex items-center gap-2">
            <span className={cn('text-base transition-colors', focused === 'phone' ? 'text-holio-text' : 'text-holio-muted')}>+1</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              className={cn(
                'w-full border-b bg-transparent py-2 text-base text-holio-text outline-none transition-colors placeholder:text-holio-muted',
                focused === 'phone' ? 'border-holio-orange' : 'border-gray-200',
              )}
            />
          </div>
        </div>
      </form>

      {err && <p className="mx-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{err}</p>}
    </div>
  )
}
