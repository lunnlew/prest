import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

export function EditorStatusBar() {
  const { content, cursorPosition, isDirty, settings } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  const lineCount = content.split('\n').length
  const charCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const hasContent = content.trim().length > 0

  return (
    <div className="h-6 px-4 flex items-center justify-between text-xs bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] text-[var(--text-muted)]">
      <div className="flex items-center gap-4">
        <span>{t.editor.lines}: {lineCount}</span>
        <span>{t.editor.words}: {wordCount}</span>
        <span>{t.editor.characters}: {charCount}</span>
      </div>

      <div className="flex items-center gap-4">
        {isDirty ? (
          <span title={t.editor.unsaved} className="flex items-center gap-1 text-yellow-500">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            {t.editor.unsaved}
          </span>
        ) : hasContent && settings.autoSave ? (
          <span title={t.settings.saved} className="flex items-center gap-1 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {t.settings.saved}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <span>
          {t.editor.lineNumber} {cursorPosition.line}, {t.editor.columnNumber} {cursorPosition.column}
        </span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>
    </div>
  )
}
