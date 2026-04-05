import { useRef, useEffect, useCallback } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { extractHeadings } from '../../services'
import { clsx } from 'clsx'

export function OutlineView() {
  const { content, cursorPosition } = useBoundStore()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  if (!t) return null

  const headings = extractHeadings(content)

  // Find the active heading: the last heading whose line is <= the cursor's current line
  const activeLine = cursorPosition.line
  let activeHeadingIdx = -1
  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].line <= activeLine) {
      activeHeadingIdx = i
      break
    }
  }

  // Auto-scroll the outline to the active heading
  const activeRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })

  if (headings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        {t.sidebar.noHeadings}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="py-2 overflow-y-auto">
      <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        {t.sidebar.outline}
      </div>
      {headings.map((heading, idx) => {
        const isActive = idx === activeHeadingIdx
        const elRef = isActive ? activeRef : null
        return (
          <div
            key={heading.line}
            ref={elRef}
            className={clsx(
              'px-4 py-1 cursor-pointer text-sm truncate',
              isActive
                ? 'bg-[var(--accent-color)]/15 text-[var(--accent-color)] font-medium'
                : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            )}
            style={{
              paddingLeft: `${(heading.level - 1) * 12 + 16}px`,
            }}
            onClick={useCallback(() => {
              const editor = useBoundStore.getState().editorInstance
              if (!editor) return
              editor.setPosition({ lineNumber: heading.line, column: 1 })
              editor.revealLineInCenter(heading.line)
              editor.focus()
            }, [heading.line])}
          >
            {heading.text}
          </div>
        )
      })}
    </div>
  )
}
