import { StateCreator } from 'zustand'
import { FileNode } from '../types'
import {
  getAllFiles,
  saveAllFiles,
  markInitialized,
  isInitialized,
  saveFile,
  deleteFile as deleteFileFromDB,
  buildTree,
  type FlatFileNode,
} from '../storage/indexedDB'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── IndexedDB persistence ───────────────────────────────────────────

let persistTimer: ReturnType<typeof setTimeout> | null = null
let pendingFiles: FileNode[] | null = null

function schedulePersist(files: FileNode[]) {
  pendingFiles = files
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    if (pendingFiles) {
      persistTree(pendingFiles).catch(() => { /* ignore */ })
      pendingFiles = null
    }
  }, 500)
}

function flattenTree(nodes: FileNode[]): FlatFileNode[] {
  const flat: FlatFileNode[] = []

  function walk(node: FileNode, parentId: string | null) {
    const record: FlatFileNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      ...(node.type === 'file' && node.content !== undefined ? { content: node.content } : {}),
      ...(node.type === 'folder' && node.children ? { children: node.children.map((c) => c.id) } : {}),
    }
    flat.push(record)
    if (node.children) {
      for (const child of node.children) walk(child, node.id)
    }
  }

  for (const node of nodes) walk(node, null)
  return flat
}

async function persistTree(files: FileNode[]) {
  const flat = flattenTree(files)
  await saveAllFiles(flat)
}

// ─── Default file structure ──────────────────────────────────────────

export const defaultFiles: FileNode[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    children: [
      {
        id: 'file-1',
        name: '欢迎.md',
        type: 'file',
        content: `# Welcome to Prest Editor

This is a **Markdown** editor with *live preview*.

## Features

- VSCode-like interface
- Resizable panels
- Syntax highlighting
- Live preview

### Code Block

\`\`\`typescript
const greeting: string = "Hello, World!"
console.log(greeting)
\`\`\`

### List

- Item 1
- Item 2
- Item 3

> This is a blockquote

[Visit GitHub](https://github.com)
`,
      },
      {
        id: 'file-2',
        name: 'Notes.md',
        type: 'file',
        content: '# Notes\n\nSome notes here.',
      },
    ],
  },
  {
    id: 'folder-2',
    name: 'Projects',
    type: 'folder',
    children: [
      {
        id: 'file-3',
        name: 'README.md',
        type: 'file',
        content: '# Project README\n\nProject description.',
      },
    ],
  },
]

// ─── Slice definition ────────────────────────────────────────────────

export interface SidebarSlice {
  files: FileNode[]
  expandedFolders: Set<string>
  searchQuery: string
  searchResults: { fileId: string; line: number; content: string }[]
  isLoadingFiles: boolean

  setFiles: (files: FileNode[]) => void
  toggleFolder: (folderId: string) => void
  setSearchQuery: (query: string) => void
  addFile: (parentFolderId: string | null, file: FileNode) => void
  deleteFile: (fileId: string) => void
  moveFile: (fileId: string, newParentId: string | null) => boolean
  loadFilesFromDB: () => Promise<void>
  createFile: (name: string, type: 'file' | 'folder', parentId: string | null) => Promise<string>
  saveFileContent: (fileId: string, content: string) => void
  renameFile: (fileId: string, newName: string) => Promise<void>
  _persistTree: (files: FileNode[]) => void
}

// ─── Tree mutation helpers ───────────────────────────────────────────

function updateContentInTree(nodes: FileNode[], fileId: string, content: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === fileId && node.type === 'file') {
      return { ...node, content }
    }
    if (node.children) {
      return { ...node, children: updateContentInTree(node.children, fileId, content) }
    }
    return node
  })
}

function addToFileTree(nodes: FileNode[], parentId: string | null, newFile: FileNode): FileNode[] {
  if (parentId === null) {
    return [...nodes, newFile]
  }

  function addToFolder(tree: FileNode[]): FileNode[] {
    return tree.map((node) => {
      if (node.id === parentId && node.type === 'folder') {
        return { ...node, children: [...(node.children || []), newFile] }
      }
      if (node.children) {
        return { ...node, children: addToFolder(node.children) }
      }
      return node
    })
  }

  return addToFolder(nodes)
}

function removeFromTree(nodes: FileNode[], fileId: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== fileId)
    .map((node) => {
      if (node.children) {
        return { ...node, children: removeFromTree(node.children, fileId) }
      }
      return node
    })
}

function findNode(nodes: FileNode[], fileId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === fileId) return node
    if (node.children) {
      const found = findNode(node.children, fileId)
      if (found) return found
    }
  }
  return null
}

/** Check if `ancestorId` is an ancestor of `descendantId` in the tree */
function isDescendant(nodes: FileNode[], ancestorId: string, descendantId: string): boolean {
  for (const node of nodes) {
    if (node.id === ancestorId && node.type === 'folder') {
      return !!findNode(node.children || [], descendantId)
    }
    if (node.children) {
      if (isDescendant(node.children, ancestorId, descendantId)) return true
    }
  }
  return false
}

function moveInTree(
  nodes: FileNode[],
  fileId: string,
  newParentId: string | null,
): FileNode[] {
  const nodeToMove = findNode(nodes, fileId)
  if (!nodeToMove) return nodes

  const withoutNode = removeFromTree(nodes, fileId)

  if (newParentId === null) {
    return [...withoutNode, nodeToMove]
  }

  function insertIntoFolder(tree: FileNode[]): FileNode[] {
    return tree.map((node) => {
      if (node.id === newParentId && node.type === 'folder') {
            const children: FileNode[] = [...(node.children || []), nodeToMove!]
        return { ...node, children }
      }
      if (node.children) {
        return { ...node, children: insertIntoFolder(node.children) }
      }
      return node
    })
  }

  return insertIntoFolder(withoutNode)
}

function renameInTree(nodes: FileNode[], fileId: string, newName: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === fileId) {
      return { ...node, name: newName }
    }
    if (node.children) {
      return { ...node, children: renameInTree(node.children, fileId, newName) }
    }
    return node
  })
}

function findInTree(nodes: FileNode[], fileId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === fileId) return node
    if (node.children) {
      const found = findInTree(node.children, fileId)
      if (found) return found
    }
  }
  return null
}

/**
 * Split a filename into [basename, extension] (only for files)
 * e.g. "readme.md" → ["readme", ".md"], "New Folder" → ["New Folder", ""]
 */
function splitFileName(name: string, type: 'file' | 'folder'): [string, string] {
  if (type === 'folder') return [name, '']
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return [name, ''] // no extension or hidden file like ".gitignore"
  return [name.slice(0, dot), name.slice(dot)]
}

/** Check if `name` already exists among siblings of the same type, if so append a number */
function dedupeName(name: string, type: 'file' | 'folder', tree: FileNode[], parentId: string | null, excludeId: string = ''): string {
  const parent = parentId ? findNode(tree, parentId) : null
  const siblings = parent && parent.type === 'folder'
    ? (parent.children || [])
    : tree

  const sameType = siblings.filter((n) => n.type === type && n.id !== excludeId)
  const names = sameType.map((n) => n.name)

  // Already unique
  if (!names.includes(name)) return name

  // Split into base + extension for files (e.g. "hello.md" → "hello" + ".md")
  const [base, ext] = splitFileName(name, type)

  // Try numbered suffix: name (1).ext, name (2).ext, ...
  const suffixRegex = /\s*\(\d+\)$/
  const cleanBase = base.replace(suffixRegex, '')
  for (let i = 1; i < 100; i++) {
    const candidate = `${cleanBase} (${i})${ext}`
    if (!names.includes(candidate)) return candidate
  }

  // Fallback: append timestamp
  return `${name}-${Date.now()}`
}

// ─── Slice implementation ────────────────────────────────────────────

export const createSidebarSlice: StateCreator<SidebarSlice, [], [], SidebarSlice> = (set, get) => ({
  files: [],  // start empty, loadFilesFromDB will populate
  expandedFolders: new Set<string>(['folder-1']),
  searchQuery: '',
  searchResults: [],
  isLoadingFiles: false,

  setFiles: (files) => {
    set({ files })
    schedulePersist(files)
  },

  toggleFolder: (folderId) =>
    set((state) => {
      const expanded = new Set(state.expandedFolders)
      if (expanded.has(folderId)) {
        expanded.delete(folderId)
      } else {
        expanded.add(folderId)
      }
      return { expandedFolders: expanded }
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  addFile: (parentFolderId, file) => {
    const updated = addToFileTree(get().files, parentFolderId, file)
    set({ files: updated })
    schedulePersist(updated)
  },

  deleteFile: (fileId) => {
    const updated = removeFromTree(get().files, fileId)
    set({ files: updated })
    deleteFileFromDB(fileId).catch(() => { /* ignore */ })
    schedulePersist(updated)
  },

  moveFile: (fileId, newParentId) => {
    // Prevent dropping a folder into itself or its own descendants
    if (fileId && newParentId && isDescendant(get().files, fileId, newParentId)) {
      return false
    }
    const updated = moveInTree(get().files, fileId, newParentId)
    set({ files: updated })
    schedulePersist(updated)
    return true
  },

  loadFilesFromDB: async () => {
    set({ isLoadingFiles: true })
    try {
      // Check if this is the very first initialization
      const hasInit = await isInitialized()
      if (!hasInit) {
        // First time ever — seed default files and mark as initialized
        await saveAllFiles(flattenTree(defaultFiles))
        await markInitialized()
        set({ files: defaultFiles, isLoadingFiles: false })
        return
      }

      // Already initialized — load whatever is in DB (even if empty)
      const flat = await getAllFiles()
      const tree = buildTree(flat)
      set({ files: tree, isLoadingFiles: false })
    } catch {
      // IndexedDB unavailable, keep defaults
      set({ files: defaultFiles, isLoadingFiles: false })
    }
  },

  createFile: async (name, type, parentId) => {
    const uniqueName = dedupeName(name, type, get().files, parentId)
    const newFile: FileNode = {
      id: generateId(type === 'folder' ? 'folder' : 'file'),
      name: uniqueName,
      type,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
    }

    // Expand parent folder
    if (parentId) {
      set((state) => {
        const expanded = new Set(state.expandedFolders)
        expanded.add(parentId)
        return { expandedFolders: expanded }
      })
    }

    get().addFile(parentId, newFile)
    return newFile.id
  },

  saveFileContent: (fileId, content) => {
    const updated = updateContentInTree(get().files, fileId, content)
    set({ files: updated })
    schedulePersist(updated)
  },

  renameFile: async (fileId, newName) => {
    // Find the node to determine its type and parent for dedup
    const node = findInTree(get().files, fileId)
    if (!node) return
    let parentId: string | null = null
    const findParent = (nodes: FileNode[], childId: string, pId: string | null): boolean => {
      for (const n of nodes) {
        if (n.id === childId) { parentId = pId; return true }
        if (n.children && findParent(n.children, childId, n.id)) return true
      }
      return false
    }
    findParent(get().files, fileId, null)
    const finalName = dedupeName(newName, node.type, get().files, parentId, fileId)
    const updated = renameInTree(get().files, fileId, finalName)
    set({ files: updated })
    const renamedNode = findInTree(updated, fileId)
    if (renamedNode) {
      const flat: FlatFileNode = {
        id: renamedNode.id,
        name: renamedNode.name,
        type: renamedNode.type,
        parentId,
        ...(renamedNode.type === 'file' && renamedNode.content !== undefined ? { content: renamedNode.content } : {}),
      }
      await saveFile(flat)
    }
    schedulePersist(updated)
  },

  _persistTree: (files) => {
    schedulePersist(files)
  },
})
