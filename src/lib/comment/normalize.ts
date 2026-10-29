const SLANG_MAP: Record<string, string> = {
  yg: 'yang',
  dgn: 'dengan',
  krn: 'karena',
  karna: 'karena',
  tp: 'tapi',
  tdk: 'tidak',
  gak: 'tidak',
  ga: 'tidak',
  nggak: 'tidak',
  bgt: 'banget',
  bngt: 'banget',
  utk: 'untuk',
  dr: 'dari',
  dg: 'dengan',
}

export function normalizeComment(text: string): string {
  let value = text.toLowerCase().trim()
  value = value.replace(/https?:\/\/\S+/g, ' [url] ')
  value = value.replace(/@\w+/g, ' [mention] ')
  value = value.replace(/#\w+/g, ' [hashtag] ')
  value = value.replace(/[^\p{L}\p{N}\s[\]]/gu, ' ')
  const tokens = value.split(/\s+/).filter(Boolean)
  const normalized = tokens.map((token) => SLANG_MAP[token] ?? token)
  return normalized.join(' ')
}

export function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(/#(\w+)/g)).map((match) => match[1].toLowerCase())
}

export function extractMentions(text: string): string[] {
  return Array.from(text.matchAll(/@(\w+)/g)).map((match) => match[1].toLowerCase())
}

export function extractUrls(text: string): string[] {
  return Array.from(text.matchAll(/https?:\/\/\S+/g)).map((match) => match[0])
}

export function countEmoji(text: string): number {
  return (text.match(/[\p{Extended_Pictographic}]/gu) || []).length
}
