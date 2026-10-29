import {
  countEmoji,
  extractHashtags,
  extractMentions,
  extractUrls,
  normalizeComment,
} from './normalize'

export interface CommentStats {
  total: number
  unique: number
  duplicateCount: number
  duplicatePercent: number
  spamCount: number
  spamPercent: number
  shortCount: number
  timestampCount: number
  hashtagCounts: Record<string, number>
  mentionCounts: Record<string, number>
  domainCounts: Record<string, number>
  burstScore: number
  concentrationScore: number
  lexicalVariety: number
  emojiCount: number
}

const SPAM_PATTERNS = [
  /\b(judi|slot|gacor|maxwin|togel|poker|casino)\b/i,
  /\b(pinjaman|kredit|dana cepat|investasi)\b/i,
  /\b(promo|diskon|gratis ongkir|cek bio|klik link)\b/i,
  /\b(wa|whatsapp|telegram|t\.me)\b/i,
  /\b(hubungi|chat admin|order)\b/i,
]

function countBy<T>(items: T[], key: (item: T) => string | undefined): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of items) {
    const value = key(item)
    if (!value) continue
    result[value] = (result[value] ?? 0) + 1
  }
  return result
}

function topShare(counts: Record<string, number>, total: number): number {
  const values = Object.values(counts)
  if (values.length === 0 || total === 0) return 0
  return Math.max(...values) / total
}

function burstScore(timestamps: string[]): number {
  const dates = timestamps
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  if (dates.length < 5) return 0

  let maxWindow = 0
  let left = 0
  for (let right = 0; right < dates.length; right += 1) {
    while (dates[right].getTime() - dates[left].getTime() > 60_000) {
      left += 1
    }
    maxWindow = Math.max(maxWindow, right - left + 1)
  }
  return Math.min(1, maxWindow / dates.length)
}

export function computeCommentStats(
  comments: Array<{ text: string; timestamp?: string }>,
  duplicateCount: number,
): CommentStats {
  const total = comments.length
  const spamCount = comments.filter((comment) =>
    SPAM_PATTERNS.some((pattern) => pattern.test(comment.text)),
  ).length

  const shortCount = comments.filter((comment) => comment.text.trim().length < 20).length
  const timestampCount = comments.filter((comment) => {
    if (!comment.timestamp) return false
    return !Number.isNaN(new Date(comment.timestamp).getTime())
  }).length

  const hashtags = comments.flatMap((comment) => extractHashtags(comment.text))
  const mentions = comments.flatMap((comment) => extractMentions(comment.text))
  const urls = comments.flatMap((comment) => extractUrls(comment.text))
  const domains = urls
    .map((url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '')
      } catch {
        return ''
      }
    })
    .filter(Boolean)

  const tokens = comments.flatMap((comment) =>
    normalizeComment(comment.text).split(/\s+/).filter(Boolean),
  )
  const uniqueTokens = new Set(tokens)
  const lexicalVariety = tokens.length === 0 ? 0 : uniqueTokens.size / tokens.length

  const hashtagCounts = countBy(hashtags, (item) => item)
  const mentionCounts = countBy(mentions, (item) => item)
  const domainCounts = countBy(domains, (item) => item)

  const concentrationScore = Math.min(
    1,
    Math.max(topShare(hashtagCounts, hashtags.length), topShare(mentionCounts, mentions.length), topShare(domainCounts, domains.length)),
  )

  return {
    total,
    unique: total - duplicateCount,
    duplicateCount,
    duplicatePercent: total === 0 ? 0 : (duplicateCount / total) * 100,
    spamCount,
    spamPercent: total === 0 ? 0 : (spamCount / total) * 100,
    shortCount,
    timestampCount,
    hashtagCounts,
    mentionCounts,
    domainCounts,
    burstScore: burstScore(comments.map((comment) => comment.timestamp ?? '')),
    concentrationScore,
    lexicalVariety,
    emojiCount: comments.reduce((sum, comment) => sum + countEmoji(comment.text), 0),
  }
}
