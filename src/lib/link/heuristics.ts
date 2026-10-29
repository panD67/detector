import domains from '../../data/domains.json'

interface DomainEntry {
  domain: string
  category: string
  reputation: number
  notes: string
}

export function domainReputation(hostname: string): { reputation: number; category: string; known: boolean } {
  const normalized = hostname.replace(/^www\./, '').toLowerCase()
  const entry = (domains.domains as DomainEntry[]).find(
    (item) => normalized === item.domain || normalized.endsWith(`.${item.domain}`),
  )
  if (!entry) return { reputation: 0.5, category: 'unknown', known: false }
  return { reputation: entry.reputation, category: entry.category, known: true }
}

const CLICKBAIT_PATTERNS = [
  /\b(heboh|viral|ternyata|bongkar|rahasia|shocking|gila|parah|jangan sampai)\b/i,
  /[!?]{2,}/,
  /\b\d+\s*(fakta|hal|alasan|bukti)\b/i,
  /^[A-Z\s!?]{12,}$/,
]

export function clickbaitScore(title: string): number {
  if (!title) return 0
  let score = 0
  for (const pattern of CLICKBAIT_PATTERNS) {
    if (pattern.test(title)) score += 0.22
  }
  if (title.length > 110) score += 0.12
  if (title !== title.toLowerCase() && title === title.toUpperCase()) score += 0.18
  return Math.min(1, score)
}

const EMOTION_WORDS = [
  'marah',
  'takut',
  'benci',
  'ancaman',
  'bahaya',
  'mengerikan',
  'scandal',
  'skandal',
  'panik',
]

export function emotionScore(text: string): number {
  const lower = text.toLowerCase()
  let count = 0
  for (const word of EMOTION_WORDS) {
    const matches = lower.match(new RegExp(`\\b${word}\\b`, 'g'))
    if (matches) count += matches.length
  }
  return Math.min(1, count / 8)
}

export function attributionScore(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  if (/"[^"]{10,}"/.test(text)) score += 0.35
  if (/\b(menurut|kata|ujar|jelas|terang)\b/.test(lower)) score += 0.25
  if (/\b(sumber|narasumber|juru bicara)\b/.test(lower)) score += 0.2
  if (/\b(https?:\/\/|www\.)/.test(lower)) score += 0.2
  return Math.min(1, score)
}

export function titleBodyConsistency(title: string, text: string): number {
  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  )
  if (titleWords.size === 0 || !text) return 0.5
  const body = text.toLowerCase()
  let matches = 0
  for (const word of titleWords) {
    if (body.includes(word)) matches += 1
  }
  return matches / titleWords.size
}

export function classifyPageType(
  url: string,
  title: string,
  text: string,
): 'news' | 'fact-check' | 'opinion' | 'satire' | 'promotion' | 'forum' | 'unknown' {
  const haystack = `${url} ${title} ${text.slice(0, 500)}`.toLowerCase()
  if (/(cek fakta|fact check|hoaks|hoax|klarifikasi|verifikasi)/.test(haystack)) {
    return 'fact-check'
  }
  if (/(satire|parodi|humor|lucu)/.test(haystack)) return 'satire'
  if (/(opini|pendapat|editorial|kolom)/.test(haystack)) return 'opinion'
  if (/(promo|diskon|jual|beli|whatsapp|telegram|hubungi)/.test(haystack)) {
    return 'promotion'
  }
  if (/(forum|komentar|thread)/.test(haystack)) return 'forum'
  if (text.length > 500) return 'news'
  return 'unknown'
}
