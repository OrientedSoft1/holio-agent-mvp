import { useState } from 'react'
import { ArrowLeft, Check, UserPlus, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import api from '../../services/api.service'

interface Props { open: boolean; onClose: () => void; onCreated?: () => void }
const CC = [{ code: '+1', flag: '🇺🇸', label: 'US' },{ code: '+44', flag: '🇬🇧', label: 'UK' },{ code: '+47', flag: '🇳🇴', label: 'NO' },{ code: '+46', flag: '🇸🇪', label: 'SE' },{ code: '+49', flag: '🇩🇪', label: 'DE' },{ code: '+33', flag: '🇫🇷', label: 'FR' },{ code: '+91', flag: '🇮🇳', label: 'IN' },{ code: '+81', flag: '🇯🇵', label: 'JP' },{ code: '+86', flag: '🇨🇳', label: 'CN' },{ code: '+61', flag: '🇦🇺', label: 'AU' },{ code: '+55', flag: '🇧🇷', label: 'BR' }]

export default function NewContactForm({ open, onClose, onCreated }: Props) {
  const [fn, setFn] = useState(''); const [ln, setLn] = useState(''); const [ph, setPh] = useState('')
  const [ci, setCi] = useState(0); const [showC, setShowC] = useState(false)
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  if (!open) return null
  const sel = CC[ci]

  async function create() {
    if (!fn.trim() || !ph.trim()) return; setSaving(true); setErr('')
    try { await api.post('/contacts', { contactUserId: `${sel.code}${ph.replace(/\D/g, '')}`, nickname: [fn.trim(), ln.trim()].filter(Boolean).join(' ') }); onCreated?.(); onClose()
    } catch (e: unknown) { const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message; setErr(m ?? 'Failed to create contact') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-3"><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-text transition-colors hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></button><h2 className="text-lg font-bold text-holio-text">New Contact</h2></div>
          <button onClick={create} disabled={saving || !fn.trim() || !ph.trim()} className="flex h-8 w-8 items-center justify-center rounded-full text-holio-orange transition-colors hover:bg-holio-orange/10 disabled:opacity-50">{saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" /> : <Check className="h-5 w-5" />}</button>
        </div>
        <div className="p-6">
          <div className="mb-6 flex justify-center"><div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gray-100"><UserPlus className="h-10 w-10 text-gray-400" /></div></div>
          <div className="space-y-4">
            <div><label className="mb-1 block text-sm font-medium text-holio-text">First Name <span className="text-red-400">*</span></label><input type="text" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="First Name" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange" autoFocus /></div>
            <div><label className="mb-1 block text-sm font-medium text-holio-text">Last Name</label><input type="text" value={ln} onChange={(e) => setLn(e.target.value)} placeholder="Last Name" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-holio-text transition-colors placeholder:text-holio-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-holio-orange" /></div>
            <div><label className="mb-1 block text-sm font-medium text-holio-text">Phone Number <span className="text-red-400">*</span></label>
              <div className="flex h-12 items-center rounded-xl border border-gray-200 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-holio-orange">
                <div className="relative"><button type="button" onClick={() => setShowC(!showC)} className="flex h-full items-center gap-1 rounded-l-xl px-3 text-sm text-holio-text transition-colors hover:bg-gray-50"><span>{sel.flag}</span><span className="text-holio-muted">{sel.code}</span><ChevronDown className="h-3.5 w-3.5 text-holio-muted" /></button>
                  {showC && <div className="absolute left-0 top-full z-20 mt-1 max-h-48 w-40 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">{CC.map((c, i) => <button key={c.code} onClick={() => { setCi(i); setShowC(false) }} className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50', i === ci && 'bg-holio-orange/10 text-holio-orange')}><span>{c.flag}</span><span>{c.label}</span><span className="text-holio-muted">{c.code}</span></button>)}</div>}
                </div><div className="mx-0 h-6 w-px bg-gray-200" /><input type="tel" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="Phone number" className="h-full flex-1 bg-transparent px-3 text-holio-text outline-none placeholder:text-holio-muted" />
              </div>
            </div>
          </div>
          {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{err}</p>}
          <button type="button" onClick={create} disabled={saving || !fn.trim() || !ph.trim()} className="mt-6 h-12 w-full rounded-xl bg-holio-orange font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50">{saving ? 'Creating...' : 'Create Contact'}</button>
        </div>
      </div>
    </div>
  )
}
