import { useState, useCallback, useRef } from 'react'
import { X, Plus, Check } from 'lucide-react'

interface CreatePollModalProps {
  open: boolean
  onClose: () => void
  onCreatePoll: (poll: {
    question: string
    options: string[]
    allowMultiple: boolean
    anonymous: boolean
    quizMode: boolean
    correctOption?: number
  }) => void
}

const MIN_OPTIONS = 2
const MAX_OPTIONS = 10

function CreatePollForm({ onClose, onCreatePoll }: Omit<CreatePollModalProps, 'open'>) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ question?: string; options?: string }>({})
  const questionRef = useRef<HTMLInputElement>(null)
  const lastOptionRef = useRef<HTMLInputElement>(null)

  const updateOption = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
    setErrors((prev) => ({ ...prev, options: undefined }))
  }, [])

  const addOption = useCallback(() => {
    if (options.length >= MAX_OPTIONS) return
    setOptions((prev) => [...prev, ''])
    setTimeout(() => lastOptionRef.current?.focus(), 50)
  }, [options.length])

  const removeOption = useCallback((index: number) => {
    if (options.length <= MIN_OPTIONS) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
    setCorrectOption((prev) => {
      if (prev === null) return null
      if (prev === index) return null
      if (prev > index) return prev - 1
      return prev
    })
  }, [options.length])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!question.trim()) newErrors.question = 'Question is required'
    const filledOptions = options.filter((o) => o.trim())
    if (filledOptions.length < MIN_OPTIONS) newErrors.options = 'At least 2 options are required'
    if (quizMode && correctOption === null) newErrors.options = 'Select the correct answer for quiz mode'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const filledOptions = options.map((o) => o.trim()).filter(Boolean)
    onCreatePoll({
      question: question.trim(),
      options: filledOptions,
      allowMultiple,
      anonymous,
      quizMode,
      correctOption: quizMode && correctOption !== null ? correctOption : undefined,
    })
    onClose()
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-holio-text dark:text-white">Create Poll</h3>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="h-4 w-4 text-holio-muted" />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-holio-muted">Question</label>
        <input
          ref={questionRef}
          autoFocus
          type="text"
          value={question}
          onChange={(e) => { setQuestion(e.target.value); setErrors((prev) => ({ ...prev, question: undefined })) }}
          placeholder="Ask a question..."
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-holio-text dark:text-white outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
        />
        {errors.question && <p className="mt-1 text-xs text-red-500">{errors.question}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-holio-muted">Options</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              {quizMode && (
                <button
                  type="button"
                  onClick={() => setCorrectOption(index)}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    correctOption === index
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                  title="Mark as correct answer"
                >
                  {correctOption === index && <Check className="h-3 w-3 text-white" />}
                </button>
              )}
              <input
                ref={index === options.length - 1 ? lastOptionRef : undefined}
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-holio-text dark:text-white outline-none placeholder:text-holio-muted focus:border-holio-orange focus:ring-2 focus:ring-holio-orange/20"
              />
              {options.length > MIN_OPTIONS && (
                <button
                  onClick={() => removeOption(index)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-holio-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && <p className="mt-1 text-xs text-red-500">{errors.options}</p>}
        {options.length < MAX_OPTIONS && (
          <button
            onClick={addOption}
            className="mt-2 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-holio-orange transition-colors hover:bg-holio-orange/10"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        )}
      </div>

      <div className="mb-5 space-y-3">
        <ToggleRow label="Allow multiple answers" enabled={allowMultiple} onToggle={() => setAllowMultiple((v) => !v)} />
        <ToggleRow label="Anonymous voting" enabled={anonymous} onToggle={() => setAnonymous((v) => !v)} />
        <ToggleRow
          label="Quiz mode"
          subtitle="Mark one answer as correct"
          enabled={quizMode}
          onToggle={() => { setQuizMode((v) => !v); setCorrectOption(null) }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 py-2.5 text-sm font-medium text-holio-text dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="flex-1 rounded-xl bg-holio-orange py-2.5 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
        >
          Create Poll
        </button>
      </div>
    </div>
  )
}

export default function CreatePollModal({ open, onClose, onCreatePoll }: CreatePollModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <CreatePollForm key={String(open)} onClose={onClose} onCreatePoll={onCreatePoll} />
    </div>
  )
}

function ToggleRow({ label, subtitle, enabled, onToggle }: { label: string; subtitle?: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-holio-text dark:text-white">{label}</p>
        {subtitle && <p className="text-xs text-holio-muted">{subtitle}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${enabled ? 'bg-holio-orange' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
