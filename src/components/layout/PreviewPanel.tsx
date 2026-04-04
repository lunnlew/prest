import { useBoundStore } from '../../stores'
import { MarkdownPreview } from '../preview/MarkdownPreview'

export function PreviewPanel() {
  const { content } = useBoundStore()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">Preview</span>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            title="Toggle sync scroll"
          >
            🔗
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        <MarkdownPreview content={content} />
      </div>
    </div>
  )
}