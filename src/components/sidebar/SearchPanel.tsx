import { useState, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

interface SearchResult {
  line: number
  content: string
  matchStart: number
  matchEnd: number
}

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const { content, editorInstance } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  const results: SearchResult[] = query.trim()
    ? content
        .split('\n')
        .reduce<SearchResult[]>((acc, line, index) => {
          const lowerLine = line.toLowerCase()
          const lowerQuery = query.toLowerCase()
          let searchPos = 0

          while (true) {
            const matchIndex = lowerLine.indexOf(lowerQuery, searchPos)
            if (matchIndex === -1) break

            acc.push({
              line: index + 1,
              content: line,
              matchStart: matchIndex,
              matchEnd: matchIndex + query.length,
            })
            searchPos = matchIndex + 1
          }

          return acc
        }, [])
    : []

  const handleResultClick = (lineNumber: number) => {
    if (editorInstance) {
      editorInstance.revealLineInCenter(lineNumber)
      editorInstance.setPosition({
        lineNumber,
        column: 1,
      })
      editorInstance.focus()
    }
  }

  useEffect(() => {
    if (!editorInstance) return

    const model = editorInstance.getModel()
    if (!model) return

    const decorations = editorInstance.deltaDecorations(
      [],
      query.trim()
        ? results.map((result) => ({
            range: {
              startLineNumber: result.line,
              startColumn: result.matchStart + 1,
              endLineNumber: result.line,
              endColumn: result.matchEnd + 1,
            },
            options: {
              className: 'search-highlight',
              inlineClassName: 'search-highlight-inline',
            },
          }))
        : []
    )

    return () => {
      editorInstance.deltaDecorations(decorations, [])
    }
  }, [query, results, editorInstance])

  const highlightMatch = (text: string, start: number, end: number) => {
    return (
      <>
        <span>{text.slice(0, start)}</span>
        <span className="bg-yellow-500/30 text-yellow-600 dark:text-yellow-400">
          {text.slice(start, end)}
        </span>
        <span>{text.slice(end)}</span>
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-[var(--border-color)]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.common.search}
          className="w-full px-3 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
        />
        {query.trim() && (
          <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {results.length} {t.sidebar.resultsFound}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {query.trim() && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.sidebar.noResults}
          </div>
        )}
        {results.map((result, index) => (
          <div
            key={`${result.line}-${index}`}
            onClick={() => handleResultClick(result.line)}
            className="px-4 py-1 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
          >
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t.editor.lineNumber} {result.line}
            </div>
            <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {highlightMatch(result.content, result.matchStart, result.matchEnd)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
