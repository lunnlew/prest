import { useEffect, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string; description: string }[]
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const { t } = useTranslation()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)
  const mod = isMac ? '⌘' : 'Ctrl'
  const shift = isMac ? '⇧' : 'Shift'

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: t?.shortcuts?.formatting || 'Formatting',
      shortcuts: [
        { keys: `${mod}+B`, description: t?.editor.bold || 'Bold' },
        { keys: `${mod}+I`, description: t?.editor.italic || 'Italic' },
        { keys: `${mod}+K`, description: t?.editor.link || 'Insert Link' },
        { keys: `${mod}+${shift}+C`, description: t?.editor.code || 'Inline Code' },
        { keys: `${mod}+/`, description: t?.editor.quote || 'Toggle Quote' },
      ],
    },
    {
      title: t?.shortcuts?.headings || 'Headings',
      shortcuts: [
        { keys: `${mod}+${shift}+1`, description: t?.editor.heading1 || 'Heading 1' },
        { keys: `${mod}+${shift}+2`, description: t?.editor.heading2 || 'Heading 2' },
        { keys: `${mod}+${shift}+3`, description: t?.editor.heading3 || 'Heading 3' },
        { keys: `${mod}+${shift}+4`, description: t?.editor.heading4 || 'Heading 4' },
        { keys: `${mod}+${shift}+5`, description: t?.editor.heading5 || 'Heading 5' },
        { keys: `${mod}+${shift}+6`, description: t?.editor.heading6 || 'Heading 6' },
      ],
    },
    {
      title: t?.shortcuts?.ai || 'AI',
      shortcuts: [
        { keys: `${mod}+${shift}+S`, description: t?.ai.summarize || 'Summarize' },
      ],
    },
    {
      title: t?.shortcuts?.navigation || 'Navigation',
      shortcuts: [
        { keys: 'Tab', description: t?.shortcuts?.nextElement || 'Next element' },
        { keys: `${shift}+Tab`, description: t?.shortcuts?.prevElement || 'Previous element' },
        { keys: 'Enter', description: t?.shortcuts?.activate || 'Activate' },
        { keys: 'Esc', description: t?.shortcuts?.close || 'Close dialog' },
      ],
    },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">
            {t?.shortcuts?.title || 'Keyboard Shortcuts'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-[var(--text-primary)]">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-0.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-color)] text-center">
          <span className="text-xs text-[var(--text-muted)]">
            {isMac
              ? t?.shortcuts?.macHint || '⌘ is the Command key on Mac'
              : t?.shortcuts?.winHint || 'Ctrl is the Control key on Windows/Linux'}
          </span>
        </div>
      </div>
    </div>
  )
}
