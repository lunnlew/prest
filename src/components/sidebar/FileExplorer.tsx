import { useState, useRef, useEffect, useCallback } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { FileNode } from '../../types'
import { clsx } from 'clsx'

interface FileTreeItemProps {
  node: FileNode
  depth: number
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void
  isRenaming: boolean
  onRenameConfirm: (id: string, name: string) => void
  onRenameCancel: () => void
  renameValue: string
  onRenameChange: (value: string) => void
}

function FileTreeItem({ node, depth, onContextMenu, isRenaming, onRenameConfirm, onRenameCancel, renameValue, onRenameChange }: FileTreeItemProps) {
  const { expandedFolders, toggleFolder, currentFile, setCurrentFile, setContent } = useBoundStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const isExpanded = expandedFolders.has(node.id)
  const isCurrentFile = currentFile === node.id
  const isFolder = node.type === 'folder'

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
      setCurrentFile(node.id)
      if (node.content) {
        setContent(node.content)
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
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
          isCurrentFile && 'bg-[var(--accent-color)]20 text-[var(--accent-color)]'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder && (
          <span className={clsx('text-xs transition-transform', isExpanded && 'rotate-90')}>
            ▶
          </span>
        )}
        <span className="text-sm">
          {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="text-sm text-[var(--text-primary)] truncate">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              isRenaming={false}
              onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel}
              renameValue=""
              onRenameChange={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer() {
  const { files, createFile, renameFile, deleteFile } = useBoundStore()
  const { t, loading } = useTranslation()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const isLoading = loading || !t

  const openContextMenu = useCallback((e: React.MouseEvent, node: FileNode | null) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }, [])

  const closeContextMenu = () => setContextMenu(null)

  useEffect(() => {
    const handler = () => closeContextMenu()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleNewFile = async (parentId: string | null, isFolder: boolean) => {
    const name = isFolder ? 'New Folder' : 'Untitled.md'
    await createFile(name, isFolder ? 'folder' : 'file', parentId)
    closeContextMenu()
  }

  const handleDelete = async () => {
    if (contextMenu?.node) {
      deleteFile(contextMenu.node.id)
      closeContextMenu()
    }
  }

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

  const node = contextMenu?.node

  return (
    <div className="py-2 relative">
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">
          {isLoading ? 'Explorer' : t.sidebar.files}
        </span>
        <button
          onClick={(e) => openContextMenu(e, null)}
          className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
          title="New File/Folder"
        >
          +
        </button>
      </div>
      {files.map((fileNode) => (
        <FileTreeItem
          key={fileNode.id}
          node={fileNode}
          depth={0}
          onContextMenu={openContextMenu}
          isRenaming={renamingId === fileNode.id}
          onRenameConfirm={handleRenameConfirm}
          onRenameCancel={handleRenameCancel}
          renameValue={renamingId === fileNode.id ? renameValue : ''}
          onRenameChange={setRenameValue}
        />
      ))}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-lg py-1 min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleNewFile(node?.type === 'folder' ? node.id : null, false)}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          >
            New File
          </button>
          {(node?.type === 'folder' || !node) && (
            <button
              onClick={() => handleNewFile(node?.type === 'folder' ? node.id : null, true)}
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            >
              New Folder
            </button>
          )}
          {node && (
            <>
              <hr className="border-[var(--border-color)] my-1" />
              <button
                onClick={() => {
                  setRenamingId(node.id)
                  setRenameValue(node.name)
                  closeContextMenu()
                }}
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              >
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-red-500/20 text-red-500"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
