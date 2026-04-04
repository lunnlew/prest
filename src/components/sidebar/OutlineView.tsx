import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { extractHeadings } from '../../services'
import { clsx } from 'clsx'

export function OutlineView() {
  const { content, setCursorPosition } = useBoundStore()
  const { t, loading } = useTranslation()

  const headings = extractHeadings(content)
  const isLoading = loading || !t

  const handleHeadingClick = (line: number) => {
    setCursorPosition({ line, column: 1 })
    // In a real implementation, this would also scroll the editor to that line
  }

  if (headings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        {isLoading ? 'No headings found' : t.sidebar.noHeadings}
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">
        {isLoading ? 'Outline' : t.sidebar.outline}
      </div>
      {headings.map((heading) => (
        <div
          key={heading.line}
          onClick={() => handleHeadingClick(heading.line)}
          className={clsx(
            'px-4 py-1 cursor-pointer hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
            'text-sm truncate'
          )}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 16}px` }}
        >
          {heading.text}
        </div>
      ))}
    </div>
  )
}