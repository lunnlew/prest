import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { extractHeadings } from '../../services'
import { clsx } from 'clsx'

export function OutlineView() {
  const { content, setCursorPosition } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  const headings = extractHeadings(content)

  const handleHeadingClick = (line: number) => {
    setCursorPosition({ line, column: 1 })
  }

  if (headings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        {t.sidebar.noHeadings}
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        {t.sidebar.outline}
      </div>
      {headings.map((heading) => (
        <div
          key={heading.line}
          onClick={() => handleHeadingClick(heading.line)}
          className={clsx(
            'px-4 py-1 cursor-pointer hover:bg-[var(--bg-tertiary)] text-sm truncate',
          )}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 16}px`, color: 'var(--text-primary)' }}
        >
          {heading.text}
        </div>
      ))}
    </div>
  )
}
