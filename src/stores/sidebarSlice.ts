import { StateCreator } from 'zustand'
import { FileNode } from '../types'
import { getAllFiles, saveFile, deleteFile, clearAllFiles } from '../storage/indexedDB'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function findFile(nodes: FileNode[], fileId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === fileId) return node
    if (node.children) {
      const found = findFile(node.children, fileId)
      if (found) return found
    }
  }
  return null
}

function buildTree(flatFiles: FileNode[]): FileNode[] {
  const idToNode = new Map<string, FileNode & { parentId?: string }>()
  const roots: FileNode[] = []

  for (const file of flatFiles) {
    idToNode.set(file.id, file as FileNode & { parentId?: string })
  }

  for (const file of flatFiles) {
    const parentId = (file as FileNode & { parentId?: string }).parentId
    if (parentId && idToNode.has(parentId)) {
      const parent = idToNode.get(parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(file)
    } else {
      roots.push(file)
    }
  }

  return roots
}

// Debounced tree persist to IndexedDB
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

async function persistTree(files: FileNode[]) {
  await clearAllFiles()
  async function saveNodes(nodes: FileNode[], parentId: string | null) {
    for (const node of nodes) {
      await saveFile({ ...node, parentId } as unknown as FileNode)
      if (node.children) await saveNodes(node.children, node.id)
    }
  }
  await saveNodes(files, null)
}

export interface SidebarSlice {
  // State
  files: FileNode[]
  expandedFolders: Set<string>
  searchQuery: string
  searchResults: { fileId: string; line: number; content: string }[]
  isLoadingFiles: boolean

  // Actions
  setFiles: (files: FileNode[]) => void
  toggleFolder: (folderId: string) => void
  setSearchQuery: (query: string) => void
  addFile: (parentFolderId: string | null, file: FileNode) => void
  deleteFile: (fileId: string) => void
  loadFilesIntoDB: () => Promise<void>
  createFile: (name: string, type: 'file' | 'folder', parentId: string | null) => Promise<void>
  renameFile: (fileId: string, newName: string) => Promise<void>
  _persistTree: (files: FileNode[]) => void
}

export const createSidebarSlice: StateCreator<SidebarSlice, [], [], SidebarSlice> = (set, get) => ({
  files: [],
  expandedFolders: new Set<string>(),
  searchQuery: '',
  searchResults: [],
  isLoadingFiles: false,

  setFiles: (files) => {
    set({ files })
    get()._persistTree(files)
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
    set((state) => {
      if (!parentFolderId) {
        return { files: [...state.files, file] }
      }

      const addToFolder = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.id === parentFolderId && node.type === 'folder') {
            return { ...node, children: [...(node.children || []), file] }
          }
          if (node.children) {
            return { ...node, children: addToFolder(node.children) }
          }
          return node
        })

      return { files: addToFolder(state.files) }
    })
    get()._persistTree(get().files)
  },

  deleteFile: (fileId) => {
    set((state) => {
      const deleteFromNodes = (nodes: FileNode[]): FileNode[] =>
        nodes
          .filter((node) => node.id !== fileId)
          .map((node) => {
            if (node.children) {
              return { ...node, children: deleteFromNodes(node.children) }
            }
            return node
          })

      return { files: deleteFromNodes(state.files) }
    })
    deleteFile(fileId).catch(() => { /* ignore */ })
    get()._persistTree(get().files)
  },

  loadFilesIntoDB: async () => {
    set({ isLoadingFiles: true })
    try {
      const dbFiles = await getAllFiles()
      if (dbFiles.length > 0) {
        const tree = buildTree(dbFiles)
        set({ files: tree, isLoadingFiles: false })
      }
    } catch {
      // Fallback - will use defaults from settingsSeed
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
    get().addFile(parentId, newFile)
  },

  renameFile: async (fileId, newName) => {
    set((state) => {
      const renameInNodes = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.id === fileId) {
            return { ...node, name: newName }
          }
          if (node.children) {
            return { ...node, children: renameInNodes(node.children) }
          }
          return node
        })

      return { files: renameInNodes(state.files) }
    })
    const file = findFile(get().files, fileId)
    if (file) {
      saveFile({ ...file, name: newName }).catch(() => { /* ignore */ })
    }
  },

  _persistTree: (files: FileNode[]) => {
    schedulePersist(files)
  },
})
