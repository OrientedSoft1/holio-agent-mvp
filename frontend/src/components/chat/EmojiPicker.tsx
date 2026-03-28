import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const SKIN_TONES = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']

const CATEGORIES: { id: string; label: string; icon: string; emojis: { char: string; name: string; skinnable?: boolean }[] }[] = [
  {
    id: 'smileys', label: 'Smileys', icon: '😀',
    emojis: [
      { char: '😀', name: 'grinning face' }, { char: '😃', name: 'smiley' }, { char: '😄', name: 'smile' },
      { char: '😁', name: 'grin' }, { char: '😅', name: 'sweat smile' }, { char: '😂', name: 'joy' },
      { char: '🤣', name: 'rofl' }, { char: '😊', name: 'blush' }, { char: '😇', name: 'innocent' },
      { char: '🙂', name: 'slightly smiling' }, { char: '😉', name: 'wink' }, { char: '😌', name: 'relieved' },
      { char: '😍', name: 'heart eyes' }, { char: '🥰', name: 'smiling hearts' }, { char: '😘', name: 'kissing heart' },
      { char: '😜', name: 'winking tongue' }, { char: '🤪', name: 'zany' }, { char: '😎', name: 'sunglasses' },
      { char: '🤓', name: 'nerd' }, { char: '🥳', name: 'party' }, { char: '😏', name: 'smirk' },
      { char: '😢', name: 'cry' }, { char: '😭', name: 'sob' }, { char: '😤', name: 'huff' },
      { char: '🤯', name: 'mind blown' }, { char: '😱', name: 'scream' }, { char: '🥱', name: 'yawn' },
      { char: '😴', name: 'sleeping' },
    ],
  },
  {
    id: 'people', label: 'People', icon: '👋',
    emojis: [
      { char: '👋', name: 'wave', skinnable: true }, { char: '👍', name: 'thumbs up', skinnable: true },
      { char: '👎', name: 'thumbs down', skinnable: true }, { char: '👏', name: 'clap', skinnable: true },
      { char: '🙌', name: 'raised hands', skinnable: true }, { char: '🤝', name: 'handshake' },
      { char: '👊', name: 'fist bump', skinnable: true }, { char: '✌️', name: 'peace', skinnable: true },
      { char: '🤞', name: 'crossed fingers', skinnable: true }, { char: '💪', name: 'flexed biceps', skinnable: true },
      { char: '🙏', name: 'pray', skinnable: true }, { char: '🤙', name: 'call me', skinnable: true },
      { char: '👀', name: 'eyes' }, { char: '👁️', name: 'eye' }, { char: '🧠', name: 'brain' },
      { char: '💀', name: 'skull' }, { char: '👻', name: 'ghost' }, { char: '🤖', name: 'robot' },
      { char: '👨‍💻', name: 'man technologist' }, { char: '👩‍💻', name: 'woman technologist' },
      { char: '🧑‍🎨', name: 'artist' }, { char: '🧑‍🔬', name: 'scientist' },
    ],
  },
  {
    id: 'animals', label: 'Animals', icon: '🐶',
    emojis: [
      { char: '🐶', name: 'dog' }, { char: '🐱', name: 'cat' }, { char: '🐭', name: 'mouse' },
      { char: '🐹', name: 'hamster' }, { char: '🐰', name: 'rabbit' }, { char: '🦊', name: 'fox' },
      { char: '🐻', name: 'bear' }, { char: '🐼', name: 'panda' }, { char: '🐨', name: 'koala' },
      { char: '🦁', name: 'lion' }, { char: '🐮', name: 'cow' }, { char: '🐷', name: 'pig' },
      { char: '🐸', name: 'frog' }, { char: '🐵', name: 'monkey' }, { char: '🐔', name: 'chicken' },
      { char: '🐧', name: 'penguin' }, { char: '🦄', name: 'unicorn' }, { char: '🐝', name: 'bee' },
      { char: '🐛', name: 'bug' }, { char: '🦋', name: 'butterfly' }, { char: '🐙', name: 'octopus' },
    ],
  },
  {
    id: 'food', label: 'Food', icon: '🍕',
    emojis: [
      { char: '🍎', name: 'apple' }, { char: '🍕', name: 'pizza' }, { char: '🍔', name: 'burger' },
      { char: '🌮', name: 'taco' }, { char: '🍣', name: 'sushi' }, { char: '🍜', name: 'ramen' },
      { char: '🍰', name: 'cake' }, { char: '🍩', name: 'donut' }, { char: '🍪', name: 'cookie' },
      { char: '🍫', name: 'chocolate' }, { char: '☕', name: 'coffee' }, { char: '🍺', name: 'beer' },
      { char: '🍷', name: 'wine' }, { char: '🥤', name: 'cup straw' }, { char: '🧁', name: 'cupcake' },
      { char: '🥑', name: 'avocado' }, { char: '🍓', name: 'strawberry' }, { char: '🍌', name: 'banana' },
    ],
  },
  {
    id: 'travel', label: 'Travel', icon: '✈️',
    emojis: [
      { char: '✈️', name: 'airplane' }, { char: '🚗', name: 'car' }, { char: '🚀', name: 'rocket' },
      { char: '🌍', name: 'globe' }, { char: '🏠', name: 'house' }, { char: '🏢', name: 'office' },
      { char: '⛰️', name: 'mountain' }, { char: '🏖️', name: 'beach' }, { char: '🌅', name: 'sunrise' },
      { char: '🌙', name: 'moon' }, { char: '⭐', name: 'star' }, { char: '☀️', name: 'sun' },
      { char: '🌈', name: 'rainbow' }, { char: '❄️', name: 'snowflake' }, { char: '🔥', name: 'fire' },
      { char: '💧', name: 'droplet' }, { char: '⚡', name: 'lightning' }, { char: '🌊', name: 'wave' },
    ],
  },
  {
    id: 'activities', label: 'Activities', icon: '⚽',
    emojis: [
      { char: '⚽', name: 'soccer' }, { char: '🏀', name: 'basketball' }, { char: '🎾', name: 'tennis' },
      { char: '🏈', name: 'football' }, { char: '🎮', name: 'video game' }, { char: '🎯', name: 'dart' },
      { char: '🎨', name: 'art palette' }, { char: '🎵', name: 'music' }, { char: '🎬', name: 'clapper' },
      { char: '📸', name: 'camera flash' }, { char: '🎸', name: 'guitar' }, { char: '🎭', name: 'performing arts' },
      { char: '🏆', name: 'trophy' }, { char: '🥇', name: 'gold medal' }, { char: '🎪', name: 'circus tent' },
    ],
  },
  {
    id: 'objects', label: 'Objects', icon: '💡',
    emojis: [
      { char: '💡', name: 'light bulb' }, { char: '📱', name: 'phone' }, { char: '💻', name: 'laptop' },
      { char: '⌨️', name: 'keyboard' }, { char: '📧', name: 'email' }, { char: '📝', name: 'memo' },
      { char: '📅', name: 'calendar' }, { char: '📎', name: 'paperclip' }, { char: '🔑', name: 'key' },
      { char: '🔒', name: 'lock' }, { char: '💰', name: 'money bag' }, { char: '💎', name: 'gem' },
      { char: '🔔', name: 'bell' }, { char: '⏰', name: 'alarm clock' }, { char: '🎁', name: 'gift' },
      { char: '📦', name: 'package' }, { char: '🧲', name: 'magnet' },
    ],
  },
  {
    id: 'symbols', label: 'Symbols', icon: '❤️',
    emojis: [
      { char: '❤️', name: 'red heart' }, { char: '🧡', name: 'orange heart' }, { char: '💛', name: 'yellow heart' },
      { char: '💚', name: 'green heart' }, { char: '💙', name: 'blue heart' }, { char: '💜', name: 'purple heart' },
      { char: '🖤', name: 'black heart' }, { char: '💔', name: 'broken heart' }, { char: '💯', name: 'hundred' },
      { char: '✅', name: 'check mark' }, { char: '❌', name: 'cross mark' }, { char: '⭕', name: 'circle' },
      { char: '🚫', name: 'prohibited' }, { char: '❓', name: 'question' }, { char: '❗', name: 'exclamation' },
      { char: '⚠️', name: 'warning' }, { char: '♻️', name: 'recycle' }, { char: '💤', name: 'zzz' },
    ],
  },
  {
    id: 'flags', label: 'Flags', icon: '🏁',
    emojis: [
      { char: '🏁', name: 'checkered flag' }, { char: '🚩', name: 'red flag' }, { char: '🏳️', name: 'white flag' },
      { char: '🏴', name: 'black flag' }, { char: '🇺🇸', name: 'us flag' }, { char: '🇬🇧', name: 'uk flag' },
      { char: '🇫🇷', name: 'france flag' }, { char: '🇩🇪', name: 'germany flag' }, { char: '🇯🇵', name: 'japan flag' },
      { char: '🇰🇷', name: 'korea flag' }, { char: '🇧🇷', name: 'brazil flag' }, { char: '🇳🇴', name: 'norway flag' },
      { char: '🇮🇹', name: 'italy flag' }, { char: '🇪🇸', name: 'spain flag' }, { char: '🇦🇺', name: 'australia flag' },
    ],
  },
]

const RECENT_KEY = 'holio-emoji-recent'

function getRecents(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecent(emoji: string) {
  const recents = getRecents().filter((e) => e !== emoji)
  recents.unshift(emoji)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 20)))
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('smileys')
  const [skinTone, setSkinTone] = useState(0)
  const [showSkinPicker, setShowSkinPicker] = useState(false)
  const [recents, setRecents] = useState<string[]>(getRecents)
  const ref = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSelect = useCallback(
    (emoji: string) => {
      saveRecent(emoji)
      setRecents(getRecents())
      onSelect(emoji)
    },
    [onSelect],
  )

  const applySkintone = (char: string, skinnable?: boolean) => {
    if (!skinnable || skinTone === 0) return char
    return char + SKIN_TONES[skinTone]
  }

  const filteredCategories = search.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        emojis: cat.emojis.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
      })).filter((cat) => cat.emojis.length > 0)
    : CATEGORIES

  const scrollToCategory = (id: string) => {
    setActiveCategory(id)
    const el = gridRef.current?.querySelector(`[data-category="${id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 z-50 mb-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="border-b border-gray-100 p-2 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-holio-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="w-full rounded-lg bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-holio-text outline-none placeholder:text-holio-muted focus:ring-1 focus:ring-holio-lavender dark:bg-gray-700 dark:text-white"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-holio-muted" />
            </button>
          )}
        </div>
      </div>

      {!search && (
        <div className="flex items-center gap-0.5 border-b border-gray-100 px-1 py-1 dark:border-gray-700">
          <button
            onClick={() => scrollToCategory('recent')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors',
              activeCategory === 'recent' ? 'bg-holio-lavender/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            )}
            title="Recent"
          >
            <Clock className="h-3.5 w-3.5 text-holio-muted" />
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors',
                activeCategory === cat.id ? 'bg-holio-lavender/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
              title={cat.label}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      <div ref={gridRef} className="h-64 overflow-y-auto p-2">
        {!search && recents.length > 0 && (
          <div data-category="recent">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-holio-muted">Recent</p>
            <div className="mb-2 grid grid-cols-8 gap-0.5">
              {recents.map((emoji, i) => (
                <button
                  key={`recent-${i}`}
                  onClick={() => handleSelect(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        {filteredCategories.map((cat) => (
          <div key={cat.id} data-category={cat.id}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-holio-muted">{cat.label}</p>
            <div className="mb-2 grid grid-cols-8 gap-0.5">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji.char}
                  onClick={() => handleSelect(applySkintone(emoji.char, emoji.skinnable))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={emoji.name}
                >
                  {applySkintone(emoji.char, emoji.skinnable)}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="py-8 text-center text-xs text-holio-muted">No emoji found</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5 dark:border-gray-700">
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setShowSkinPicker(!showSkinPicker)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Skin tone"
          >
            {'👋' + (SKIN_TONES[skinTone] || '')}
          </button>
          {showSkinPicker && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-md dark:border-gray-600 dark:bg-gray-800">
              {SKIN_TONES.map((tone, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSkinTone(idx); setShowSkinPicker(false) }}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md text-lg',
                    skinTone === idx ? 'bg-holio-lavender/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                  )}
                >
                  {'👋' + (tone || '')}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-holio-muted">
          {activeCategory === 'recent' ? 'Recent' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
        </span>
      </div>
    </div>
  )
}
