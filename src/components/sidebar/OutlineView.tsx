import { useRef, useEffect, useCallback } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { extractHeadings } from '../../services'
import { clsx } from 'clsx'

export function OutlineView() {
  const { content, cursorPosition, editorVisibleTopLine } = useBoundStore()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastActiveLineRef = useRef<number | null>(null)
  const isUserScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!t) return null

  const headings = extractHeadings(content)

  // Find the active heading based on visible top line (from editor scroll)
  // The active heading is the first heading whose line >= editorVisibleTopLine
  // If no such heading, use the last heading
  let activeLine = editorVisibleTopLine || cursorPosition.line
  let activeHeadingIdx = -1

  // Find first heading with line >= activeLine
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].line >= activeLine) {
      activeHeadingIdx = i
      break
    }
  }

  // If no heading found (scrolled past all headings), use the last one
  if (activeHeadingIdx === -1 && headings.length > 0) {
    activeHeadingIdx = headings.length - 1
  }

  // Also find by cursor position as fallback for click navigation
  let cursorActiveHeadingIdx = -1
  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].line <= cursorPosition.line) {
      cursorActiveHeadingIdx = i
      break
    }
  }

  // Prefer cursor-based active index if valid, otherwise use scroll-based
  const effectiveActiveIdx = cursorActiveHeadingIdx !== -1 ? cursorActiveHeadingIdx : activeHeadingIdx

  // Auto-scroll the outline to the active heading only if it's not visible
  const activeRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const container = containerRef.current
    const activeEl = activeRef.current
    if (!container || !activeEl) return

    // If user is manually scrolling, don't override
    if (isUserScrollingRef.current) return

    // If active line hasn't changed, don't scroll
    if (lastActiveLineRef.current === activeLine) return
    lastActiveLineRef.current = activeLine

    // Check if active element is already visible
    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    const isVisible = (
      activeRect.top >= containerRect.top &&
      activeRect.bottom <= containerRect.bottom
    )

    // Only scroll if not visible
    if (!isVisible) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })

  // Detect user scroll to pause auto-scroll
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false
    }, 300)
  }, [])

  if (headings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        {t.sidebar.noHeadings}
      </div>
    )
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="py-2 overflow-y-auto">
      <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        {t.sidebar.outline}
      </div>
      {headings.map((heading, idx) => {
        const isActive = idx === effectiveActiveIdx
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
            onClick={() => {
              // Temporarily disable auto-scroll when user clicks
              isUserScrollingRef.current = true
              if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
              }
              scrollTimeoutRef.current = setTimeout(() => {
                isUserScrollingRef.current = false
              }, 500)

              const editor = useBoundStore.getState().editorInstance
              if (!editor) return
              editor.setPosition({ lineNumber: heading.line, column: 1 })
              editor.revealLineInCenter(heading.line)
              editor.focus()
            }}
          >
            {heading.text}
          </div>
        )
      })}
    </div>
  )
}
