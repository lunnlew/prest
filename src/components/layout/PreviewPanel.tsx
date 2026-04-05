import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { MarkdownPreview } from '../preview/MarkdownPreview'

export function PreviewPanel() {
  const { content } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  return (
    <div className="flex flex-col h-full">
      <div className="h-9 px-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">{t.preview.title}</span>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            title={t.preview.toggleSyncScroll}
          >
            🔗
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <MarkdownPreview content={content} />
      </div>
    </div>
  )
}
