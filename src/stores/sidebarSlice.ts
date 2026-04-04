import { StateCreator } from 'zustand'
import { FileNode } from '../types'

export interface SidebarSlice {
  // State
  files: FileNode[]
  expandedFolders: Set<string>
  searchQuery: string
  searchResults: { fileId: string; line: number; content: string }[]

  // Actions
  setFiles: (files: FileNode[]) => void
  toggleFolder: (folderId: string) => void
  setSearchQuery: (query: string) => void
  addFile: (parentFolderId: string | null, file: FileNode) => void
  deleteFile: (fileId: string) => void
}

const defaultFiles: FileNode[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    children: [
      {
        id: 'file-1',
        name: 'Welcome.md',
        type: 'file',
        content: '# Welcome\n\nThis is a welcome document.',
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

export const createSidebarSlice: StateCreator<SidebarSlice, [], [], SidebarSlice> = (set) => ({
  files: defaultFiles,
  expandedFolders: new Set(['folder-1']),
  searchQuery: '',
  searchResults: [],

  setFiles: (files) => set({ files }),

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

  addFile: (parentFolderId, file) =>
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
    }),

  deleteFile: (fileId) =>
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
    }),
})