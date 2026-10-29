import type { AiRequest, AiResponse } from './types'

const CACHE_PREFIX = 'hoaxlab:ai:cache:'
const memoryCache = new Map<string, { value: AiResponse; expiresAt: number }>()

function storage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function requestHash(profileId: string, request: AiRequest): string {
  const payload = JSON.stringify({
    profileId,
    system: request.system,
    user: request.user,
    images: request.images?.map((image) => image.mimeType),
    webSearch: request.webSearch ?? false,
    jsonMode: request.jsonMode ?? false,
  })
  let hash = 0
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(index)
    hash |= 0
  }
  return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`
}

export function getCached(hash: string): AiResponse | null {
  const memory = memoryCache.get(hash)
  if (memory && memory.expiresAt > Date.now()) return memory.value
  memoryCache.delete(hash)

  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(hash)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value: AiResponse; expiresAt: number }
    if (parsed.expiresAt <= Date.now()) {
      store.removeItem(hash)
      return null
    }
    memoryCache.set(hash, parsed)
    return parsed.value
  } catch {
    return null
  }
}

export function setCached(hash: string, value: AiResponse, ttlMs = 600_000): void {
  const entry = { value, expiresAt: Date.now() + ttlMs }
  memoryCache.set(hash, entry)
  const store = storage()
  if (!store) return
  try {
    store.setItem(hash, JSON.stringify(entry))
  } catch {
    // Session storage can be full; memory cache remains available.
  }
}

export function clearAiCache(): void {
  memoryCache.clear()
  const store = storage()
  if (!store) return
  try {
    Object.keys(store)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => store.removeItem(key))
  } catch {
    // Ignore storage cleanup errors.
  }
}
