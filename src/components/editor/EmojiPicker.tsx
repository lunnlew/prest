import { useState, useRef, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

// Common emoji categories
const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕'],
  gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  objects: ['📝', '📖', '📚', '📌', '📍', '🔖', '🏷️', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️'],
  symbols: ['✅', '❌', '❓', '❗', '‼️', '⁉️', '🔟', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '💠', '🔘', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️'],
  nature: ['🌸', '🌺', '🌻', '🌹', '🥀', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '☀️', '🌙', '⭐', '🌈', '☁️', '⛅', '🌧️', '⛈️', '❄️', '💨', '🌊', '🔥', '💧', '🌿', '🍀', '🍁', '🍂', '🍃'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '✈️', '🛫', '🛬', '🛩️', '🚀', '🛸', '🚁', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🎪', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🕹️', '🎰'],
}

type EmojiCategory = keyof typeof EMOJI_CATEGORIES

export function EmojiPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('smileys')
  const { insertText } = useBoundStore()
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Expose open method via a custom event
  useEffect(() => {
    const handleOpenEmojiPicker = () => {
      setIsOpen(true)
    }
    window.addEventListener('open-emoji-picker', handleOpenEmojiPicker)
    return () => window.removeEventListener('open-emoji-picker', handleOpenEmojiPicker)
  }, [])

  const handleInsert = (emoji: string) => {
    insertText(emoji)
    setIsOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (search) {
      // Search across all categories
      const allEmojis = Object.values(EMOJI_CATEGORIES).flat()
      return allEmojis
    }
    return EMOJI_CATEGORIES[selectedCategory]
  }

  const emojis = getFilteredEmojis()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl w-80 max-h-96 flex flex-col"
      >
        <div className="p-3 border-b border-[var(--border-color)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            {t?.editor.emoji || 'Emoji'}
          </h3>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search emoji..."
            className="w-full px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
            {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs shrink-0 ${
                  selectedCategory === category
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-color)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {EMOJI_CATEGORIES[category][0]}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto p-1">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleInsert(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-[var(--bg-tertiary)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2 border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 text-sm rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            {t?.common.cancel || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
