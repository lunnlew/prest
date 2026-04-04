import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { FileNode } from '../../types'
import { clsx } from 'clsx'

interface FileTreeItemProps {
  node: FileNode
  depth: number
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const { expandedFolders, toggleFolder, currentFile, setCurrentFile, setContent } = useBoundStore()

  const isExpanded = expandedFolders.has(node.id)
  const isCurrentFile = currentFile === node.id
  const isFolder = node.type === 'folder'

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.id)
    } else {
      setCurrentFile(node.id)
      if (node.content) {
        setContent(node.content)
      }
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[var(--bg-tertiary)]',
          isCurrentFile && 'bg-[var(--accent-color)]20 text-[var(--accent-color)]'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/Collapse Arrow */}
        {isFolder && (
          <span className={clsx('text-xs transition-transform', isExpanded && 'rotate-90')}>
            ▶
          </span>
        )}

        {/* Icon */}
        <span className="text-sm">
          {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>

        {/* Name */}
        <span className="text-sm text-[var(--text-primary)] truncate">{node.name}</span>
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer() {
  const { files } = useBoundStore()
  const { t, loading } = useTranslation()

  const isLoading = loading || !t

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">
        {isLoading ? 'Explorer' : t.sidebar.files}
      </div>
      {files.map((node) => (
        <FileTreeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  )
}