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
        name: 'Welcome.md',
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
    const newFile: FileNode = {
      id: generateId(type === 'folder' ? 'folder' : 'file'),
      name,
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
    const updated = renameInTree(get().files, fileId, newName)
    set({ files: updated })
    const node = findInTree(updated, fileId)
    if (node) {
      const flat: FlatFileNode = {
        id: node.id,
        name: newName,
        type: node.type,
        parentId: null,
        ...(node.type === 'file' && node.content !== undefined ? { content: node.content } : {}),
      }
      await saveFile(flat)
    }
    schedulePersist(updated)
  },

  _persistTree: (files) => {
    schedulePersist(files)
  },
})
