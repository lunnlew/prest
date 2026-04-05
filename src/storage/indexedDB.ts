import type { FileNode } from '../types'

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

export async function getAllFiles(): Promise<FileNode[]> {
  const store = await getStore('readonly')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function saveFile(file: FileNode): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put(file)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteFile(id: string): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getFile(id: string): Promise<FileNode | undefined> {
  const store = await getStore('readonly')
  return new Promise((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllFiles(): Promise<void> {
  const store = await getStore('readwrite')
  return new Promise((resolve, reject) => {
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
