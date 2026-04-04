import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

export function EditorStatusBar() {
  const { content, cursorPosition, isDirty, settings } = useBoundStore()
  const { t, loading } = useTranslation()

  const lineCount = content.split('\n').length
  const charCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  // 加载中使用默认显示
  const isLoading = loading || !t

  // Check if content has been modified from empty (has actual content)
  const hasContent = content.trim().length > 0

  return (
    <div className="h-6 px-4 flex items-center justify-between text-xs bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] text-[var(--text-muted)]">
      {/* Left */}
      <div className="flex items-center gap-4">
        <span>{isLoading ? 'Lines:' : t.editor.lines}: {lineCount}</span>
        <span>{isLoading ? 'Words:' : t.editor.words}: {wordCount}</span>
        <span>{isLoading ? 'Chars:' : t.editor.characters}: {charCount}</span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-4">
        {isDirty ? (
          <span title={isLoading ? 'Unsaved changes' : t.editor.unsaved} className="flex items-center gap-1 text-yellow-500">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            {isLoading ? 'Unsaved' : t.editor.unsaved}
          </span>
        ) : hasContent && settings.autoSave ? (
          <span title="Auto-saved" className="flex items-center gap-1 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {isLoading ? 'Saved' : '已保存'}
          </span>
        ) : null}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span>
          {isLoading ? 'Ln' : t.editor.lineNumber} {cursorPosition.line}, {isLoading ? 'Col' : t.editor.columnNumber} {cursorPosition.column}
        </span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>
    </div>
  )
}
