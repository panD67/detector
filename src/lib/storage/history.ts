import type { AnalysisResult } from '../../types/analysis'

const DB_NAME = 'hoaxlab'
const DB_VERSION = 1
const STORE_NAME = 'history'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveHistory(result: AnalysisResult): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(result)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function listHistory(limit = 100): Promise<AnalysisResult[]> {
  const db = await openDb()
  const results = await new Promise<AnalysisResult[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('createdAt')
    const request = index.openCursor(null, 'prev')
    const items: AnalysisResult[] = []
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor || items.length >= limit) {
        resolve(items)
        return
      }
      items.push(cursor.value as AnalysisResult)
      cursor.continue()
    }
    request.onerror = () => reject(request.error)
  })
  db.close()
  return results
}

export async function getHistory(id: string): Promise<AnalysisResult | null> {
  const db = await openDb()
  const result = await new Promise<AnalysisResult | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onsuccess = () => resolve((request.result as AnalysisResult) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return result
}

export async function deleteHistory(id: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function clearHistory(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
