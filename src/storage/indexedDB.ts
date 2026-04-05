import type { FileNode } from '../types'

/**
 * Flat representation in IndexedDB.
 * parentId links children to parents.
 * content only on files, children only on folders.
 */
export interface FlatFileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content?: string      // only for files
  children?: string[]   // only for folders — stores child IDs only, not nested objects
}

const DB_NAME = 'prest-files'
const DB_VERSION = 1
const STORE_NAME = 'files'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

async function getStore(mode: 'readonly' | 'readwrite'): Promise<IDBObjectStore> {
  const db = await openDB()
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

/** Get all flat file nodes from IndexedDB */
export async function getAllFiles(): Promise<FlatFileNode[]> {
  const store = await getStore('readonly')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve((request.result as FlatFileNode[]) || [])
    request.onerror = () => reject(request.error)
  })
}

/** Check if DB has ever been initialized (has a welcome file marker) */
export async function isInitialized(): Promise<boolean> {
  const store = await getStore('readonly')
  return new Promise((resolve, reject) => {
    const request = store.get('__prest_init_marker__')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

/** Mark that the DB has been initialized */
export async function markInitialized(): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ id: '__prest_init_marker__', v: 1 })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/** Replace ALL data in the file store */
export async function saveAllFiles(nodes: FlatFileNode[]): Promise<void> {
  const store = await getStore('readwrite')
  for (const node of nodes) {
    await new Promise<void>((resolve, reject) => {
      const request = store.put(node)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

/** Update or insert a single flat file node */
export async function saveFile(node: FlatFileNode): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put(node)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** Delete a single flat file node */
export async function deleteFile(id: string): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** Clear the entire file store */
export async function clearAllFiles(): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/** Build a tree of FileNode from flat FlatFileNode records using parentId */
export function buildTree(flatNodes: FlatFileNode[]): FileNode[] {
  const idToNode = new Map<string, FileNode>()

  // First pass: convert FlatFileNode → FileNode
  for (const flat of flatNodes) {
    if (flat.id === '__prest_init_marker__') continue
    const node: FileNode = {
      id: flat.id,
      name: flat.name,
      type: flat.type,
      ...(flat.type === 'file' && flat.content !== undefined ? { content: flat.content } : {}),
    }
    if (flat.type === 'folder' && flat.children) {
      node.children = []
    }
    idToNode.set(flat.id, node)
  }

  // Second pass: wire children via parentId
  const roots: FileNode[] = []
  for (const flat of flatNodes) {
    if (flat.id === '__prest_init_marker__') continue
    const node = idToNode.get(flat.id)
    if (!node) continue

    if (flat.parentId && idToNode.has(flat.parentId)) {
      const parent = idToNode.get(flat.parentId)!
      if (parent.type === 'folder') {
        if (!parent.children) parent.children = []
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}
