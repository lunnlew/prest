import { useState, useRef, useEffect, useCallback } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { FileNode } from '../../types'
import { clsx } from 'clsx'
import { useContextMenu, ContextMenuPopover, type ContextMenuItem } from '../common/ContextMenu'

// ─── FileTreeItem ────────────────────────────────────────────────────

interface FileTreeItemProps {
  node: FileNode
  depth: number
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void
  onRename: (id: string, name: string) => void
  renamingId: string | null
  renameValue: string
  onRenameChange: (value: string) => void
  onRenameConfirm: (id: string, name: string) => void
  onRenameCancel: () => void
}

function FileTreeItem(props: FileTreeItemProps) {
  const { node, depth, onContextMenu, onRename, renamingId, renameValue, onRenameChange, onRenameConfirm, onRenameCancel } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const { expandedFolders, toggleFolder, currentFile, setCurrentFile, setContent, content, saveFileContent } = useBoundStore()

  const isExpanded = expandedFolders.has(node.id)
  const isCurrentFile = currentFile === node.id
  const isFolder = node.type === 'folder'
  const isRenaming = renamingId === node.id

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleClick = () => {
    if (isRenaming) return
    if (isFolder) {
      toggleFolder(node.id)
    } else {
      if (currentFile) {
        saveFileContent(currentFile, content)
      }
      setCurrentFile(node.id)
      setContent(node.content ?? '')
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e, node)
  }

  if (isRenaming) {
    return (
      <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
        <span className="text-sm">{isFolder ? '📁' : '📄'}</span>
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={() => onRenameConfirm(node.id, renameValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameConfirm(node.id, renameValue)
            if (e.key === 'Escape') onRenameCancel()
          }}
          className="text-sm bg-[var(--bg-tertiary)] outline-none border border-[var(--accent-color)] rounded px-1 text-[var(--text-primary)] w-28"
        />
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={clsx(
          'flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[var(--bg-tertiary)]',
          isCurrentFile && 'bg-[var(--file-active-bg)] text-[#ffffff] border-l-2 border-[#0078d4]'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder && (
          <span className={clsx('text-xs transition-transform', isExpanded && 'rotate-90')}>▶</span>
        )}
        <span className="text-sm">
          {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="text-sm text-[var(--text-primary)] truncate">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              onRename={onRename}
              renamingId={renamingId}
              renameValue={renameValue}
              onRenameChange={onRenameChange}
              onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FileExplorer ────────────────────────────────────────────────────

export function FileExplorer() {
  const { files, createFile, renameFile, deleteFile, setCurrentFile, setContent } = useBoundStore()
  const { t, loading } = useTranslation()
  const { menu, menuRef, showContextMenu } = useContextMenu()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const isLoading = loading || !t

  const closeMenu = useCallback(() => showContextMenu(-999, -999, []), [showContextMenu])

  // Build context menu items based on what was right-clicked
  const buildMenuItems = useCallback((node: FileNode | null): ContextMenuItem[] => {
    const parentId = node?.type === 'folder' ? node.id : null

    return [
      {
        label: 'New File',
        action: async () => {
          const newId = await createFile('Untitled.md', 'file', parentId)
          setCurrentFile(newId)
          setContent('')
        },
      },
      {
        label: 'New Folder',
        action: async () => {
          await createFile('New Folder', 'folder', parentId)
        },
      },
      ...(node ? [
        { dividerBefore: true, label: 'Rename', action: () => { setRenamingId(node.id); setRenameValue(node.name) } },
        { dividerBefore: false, label: 'Delete', action: () => { deleteFile(node.id) }, danger: true },
      ] : []),
    ]
  }, [createFile, deleteFile, setCurrentFile, setContent])

  const openContextMenu = useCallback((e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault()
    showContextMenu(e.clientX, e.clientY, buildMenuItems(node))
  }, [showContextMenu, buildMenuItems])

  const handleRenameConfirm = (id: string, name: string) => {
    if (name.trim()) {
      renameFile(id, name.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleRenameCancel = () => {
    setRenamingId(null)
    setRenameValue('')
  }

  return (
    <div className="py-2 relative min-h-full" onContextMenu={(e) => { e.preventDefault(); openContextMenu(e, null) }}>
      {/* Header bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">
          {isLoading ? 'Explorer' : t.sidebar.files}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            openContextMenu(e, null)
          }}
          className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
          title="New File/Folder"
        >
          +
        </button>
      </div>

      {/* File tree */}
      {files.map((fileNode) => (
        <FileTreeItem
          key={fileNode.id}
          node={fileNode}
          depth={0}
          onContextMenu={openContextMenu}
          onRename={(id, name) => { setRenamingId(id); setRenameValue(name) }}
          renamingId={renamingId}
          renameValue={renameValue}
          onRenameChange={setRenameValue}
          onRenameConfirm={handleRenameConfirm}
          onRenameCancel={handleRenameCancel}
        />
      ))}

      {/* Context menu popover */}
      <ContextMenuPopover menu={menu} menuRef={menuRef} onClose={closeMenu} />
    </div>
  )
}
