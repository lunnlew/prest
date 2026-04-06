import { useState, useRef, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'sql', 'html', 'css', 'json', 'yaml', 'xml', 'markdown',
  'bash', 'powershell', 'dockerfile', 'plaintext'
]

export function CodeBlockDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLang, setSelectedLang] = useState('javascript')
  const { formatMarkdown } = useBoundStore()
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const filteredLangs = LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(search.toLowerCase())
  )

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

  const handleInsert = () => {
    // Insert code block with selected language
    formatMarkdown('codeBlock', selectedLang)
    setIsOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInsert()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Expose open method via a custom event
  useEffect(() => {
    const handleOpenCodeBlock = () => {
      setIsOpen(true)
    }
    window.addEventListener('open-codeblock-dialog', handleOpenCodeBlock)
    return () => window.removeEventListener('open-codeblock-dialog', handleOpenCodeBlock)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl w-80 max-h-96 flex flex-col"
      >
        <div className="p-3 border-b border-[var(--border-color)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            {t?.editor.codeBlock || 'Code Block'}
          </h3>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search language..."
            className="w-full px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        <div className="flex-1 overflow-auto p-1">
          {filteredLangs.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLang(lang)
                handleInsert()
              }}
              className={`w-full px-3 py-1.5 text-sm text-left rounded hover:bg-[var(--bg-tertiary)] ${
                selectedLang === lang
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="p-2 border-t border-[var(--border-color)] flex justify-end gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 text-sm rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            {t?.common.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleInsert}
            className="px-3 py-1 text-sm rounded bg-[var(--accent-color)] text-white hover:opacity-90"
          >
            {t?.common.save || 'Insert'}
          </button>
        </div>
      </div>
    </div>
  )
}
