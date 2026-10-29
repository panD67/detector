import { z } from 'zod'
import type { AnalysisResult } from '../../types/analysis'
import { downloadJson } from '../utils'

const HISTORY_ITEM_SCHEMA = z.object({
  id: z.string(),
  type: z.enum(['link', 'comment', 'image']),
  createdAt: z.string(),
  status: z.enum(['no-strong-indication', 'needs-verification', 'strong-indication', 'unverifiable']),
  score: z.number().min(0).max(100),
  confidence: z.enum(['low', 'medium', 'high']),
  title: z.string(),
})

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
  try {
    await putHistory(db, result)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      await deleteOldestHistory(db, 3)
      await putHistory(db, result)
    } else {
      throw error
    }
  } finally {
    db.close()
  }
}

function putHistory(db: IDBDatabase, result: AnalysisResult): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(result)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteOldestHistory(db: IDBDatabase, count: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const index = tx.objectStore(STORE_NAME).index('createdAt')
    const request = index.openCursor(null, 'next')
    let deleted = 0
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor || deleted >= count) {
        resolve()
        return
      }
      cursor.delete()
      deleted += 1
      cursor.continue()
    }
    request.onerror = () => reject(request.error)
  })
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

export function validateHistoryImport(data: unknown): AnalysisResult[] {
  if (!Array.isArray(data)) {
    throw new Error('File impor harus berisi array JSON.')
  }
  return data.map((item) => {
    HISTORY_ITEM_SCHEMA.parse(item)
    return item as AnalysisResult
  })
}

export function exportHistory(items: AnalysisResult[]): void {
  downloadJson(`hoaxlab-history-${new Date().toISOString().slice(0, 10)}.json`, items)
}

export async function importHistory(items: AnalysisResult[]): Promise<void> {
  for (const item of items) {
    await saveHistory(item)
  }
}
