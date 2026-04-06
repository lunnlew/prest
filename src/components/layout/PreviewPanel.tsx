import { useRef, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { MarkdownPreview } from '../preview/MarkdownPreview'
import { XiaohongshuPreview } from '../preview/XiaohongshuPreview'
import type { PlatformPreviewId } from '../../types'

const platformOptions: { id: PlatformPreviewId; label: string }[] = [
  { id: 'default', label: '文档' },
  { id: 'xiaohongshu', label: '小红书' },
]

export function PreviewPanel() {
  const { content, platformPreview, settings, setPlatformPreview, syncScroll, toggleSyncScroll, editorScrollRatio } = useBoundStore()
  const { t } = useTranslation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const xhs = settings.xhsExport

  // Sync scroll from editor to preview
  useEffect(() => {
    if (!t || !syncScroll || isScrollingRef.current) return

    const container = scrollContainerRef.current
    if (!container) return

    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const maxScroll = scrollHeight - clientHeight

    if (maxScroll > 0) {
      const targetScrollTop = editorScrollRatio * maxScroll
      container.scrollTop = targetScrollTop
    }
  }, [syncScroll, editorScrollRatio, t])

  // Handle preview scroll - update editor scroll ratio when user scrolls preview
  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll) return

    const container = e.currentTarget
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const maxScroll = scrollHeight - clientHeight

    if (maxScroll > 0) {
      isScrollingRef.current = true
      useBoundStore.getState().setEditorScrollRatio(container.scrollTop / maxScroll)
      // Reset flag after a short delay to re-enable sync from editor
      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }
  }

  if (!t) return null

  return (
    <div className="flex flex-col h-full">
      <div className="h-9 px-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">{t.preview.title}</span>
        <div className="flex items-center gap-2">
          {/* Platform preview selector */}
          <select
            value={platformPreview}
            onChange={(e) => setPlatformPreview(e.target.value as PlatformPreviewId)}
            className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
            title="切换预览风格"
          >
            {platformOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={toggleSyncScroll}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              syncScroll
                ? 'bg-[var(--accent-color)] text-white'
                : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
            title={t.preview.toggleSyncScroll}
          >
            {syncScroll ? '🔗' : '⛓️‍💥'}
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handlePreviewScroll}
        className="flex-1 overflow-auto"
      >
        {platformPreview === 'xiaohongshu' ? (
          <div className="bg-[var(--bg-primary)] py-6 px-4 min-h-full flex justify-center">
            <div className="w-full max-w-[480px]">
              <XiaohongshuPreview
                content={content}
                template={xhs.template}
                watermark={xhs.watermark}
                watermarkPosition={xhs.watermarkPosition}
                watermarkOpacity={xhs.watermarkOpacity}
                watermarkSize={xhs.watermarkSize}
                showPageNumber={xhs.showPageNumber}
              />
            </div>
          </div>
        ) : (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  )
}
