const PERMUTATIONS = 64
const BANDS = 8
const ROWS = PERMUTATIONS / BANDS
const PRIME = 2147483647

function hashToken(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash % PRIME
}

function makePermutations(): Array<{ a: number; b: number }> {
  const result: Array<{ a: number; b: number }> = []
  let seed = 17
  for (let index = 0; index < PERMUTATIONS; index += 1) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const a = (seed % (PRIME - 1)) + 1
    seed = (seed * 1103515245 + 12345) >>> 0
    const b = seed % PRIME
    result.push({ a, b })
  }
  return result
}

const PERMUTATION_LIST = makePermutations()

function shingles(tokens: string[]): string[] {
  if (tokens.length === 0) return []
  if (tokens.length < 3) return [tokens.join(' ')]
  const result: string[] = []
  for (let index = 0; index <= tokens.length - 3; index += 1) {
    result.push(tokens.slice(index, index + 3).join(' '))
  }
  return result
}

function minHashSignature(tokens: string[]): number[] {
  const grams = shingles(tokens)
  const gramHashes = grams.map(hashToken)
  return PERMUTATION_LIST.map(({ a, b }) => {
    if (gramHashes.length === 0) return PRIME
    let min = PRIME
    for (const hash of gramHashes) {
      const value = (a * hash + b) % PRIME
      if (value < min) min = value
    }
    return min
  })
}

function jaccard(left: string[], right: string[]): number {
  const leftSet = new Set(left)
  const rightSet = new Set(right)
  if (leftSet.size === 0 && rightSet.size === 0) return 1
  let intersection = 0
  for (const item of leftSet) {
    if (rightSet.has(item)) intersection += 1
  }
  const union = leftSet.size + rightSet.size - intersection
  return union === 0 ? 0 : intersection / union
}

export interface DuplicateCluster {
  representative: string
  ids: string[]
  size: number
  similarity: number
}

export function findDuplicates(
  comments: Array<{ id: string; normalized: string; tokens: string[] }>,
): {
  exactGroups: Map<string, string[]>
  nearClusters: DuplicateCluster[]
} {
  const exactGroups = new Map<string, string[]>()
  for (const comment of comments) {
    const key = comment.normalized
    const group = exactGroups.get(key)
    if (group) group.push(comment.id)
    else exactGroups.set(key, [comment.id])
  }

  const signatures = comments.map((comment) => ({
    id: comment.id,
    tokens: comment.tokens,
    signature: minHashSignature(comment.tokens),
  }))

  const buckets = new Map<string, string[]>()
  for (const item of signatures) {
    for (let band = 0; band < BANDS; band += 1) {
      const start = band * ROWS
      const bandValues = item.signature.slice(start, start + ROWS).join(',')
      const key = `${band}:${bandValues}`
      const bucket = buckets.get(key)
      if (bucket) bucket.push(item.id)
      else buckets.set(key, [item.id])
    }
  }

  const candidatePairs = new Set<string>()
  for (const ids of buckets.values()) {
    if (ids.length < 2) continue
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const pair = ids[i] < ids[j] ? `${ids[i]}|${ids[j]}` : `${ids[j]}|${ids[i]}`
        candidatePairs.add(pair)
      }
    }
  }

  const idToTokens = new Map(comments.map((comment) => [comment.id, comment.tokens]))
  const visited = new Set<string>()
  const nearClusters: DuplicateCluster[] = []

  for (const pair of candidatePairs) {
    const [left, right] = pair.split('|')
    if (visited.has(pair)) continue
    const similarity = jaccard(idToTokens.get(left) ?? [], idToTokens.get(right) ?? [])
    if (similarity < 0.82) continue
    visited.add(pair)
    nearClusters.push({
      representative: left,
      ids: [left, right],
      size: 2,
      similarity,
    })
  }

  return { exactGroups, nearClusters }
}
