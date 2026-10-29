export interface ParsedComment {
  id: string
  username?: string
  text: string
  timestamp?: string
  replyTo?: string
  raw: string
}

export interface ParseResult {
  comments: ParsedComment[]
  warnings: string[]
  format: 'text' | 'csv' | 'json'
}

const TEXT_FIELDS = ['text', 'comment', 'komentar', 'content', 'message', 'isi']
const USER_FIELDS = ['username', 'user', 'author', 'akun', 'name', 'pengguna']
const TIME_FIELDS = ['timestamp', 'time', 'waktu', 'date', 'created_at', 'createdAt']
const REPLY_FIELDS = ['reply_to', 'replyTo', 'parent', 'parent_id', 'in_reply_to']

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
}

function findField(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.includes(header))
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      current.push(field)
      field = ''
    } else if (char === '\n') {
      current.push(field)
      rows.push(current)
      current = []
      field = ''
    } else if (char === '\r') {
      // Ignore CR; LF handles row boundary.
    } else {
      field += char
    }
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ''))
}

function detectDelimiter(sample: string): ',' | ';' | '\t' {
  const counts = {
    ',': (sample.match(/,/g) || []).length,
    ';': (sample.match(/;/g) || []).length,
    '\t': (sample.match(/\t/g) || []).length,
  }
  const entries = Object.entries(counts) as Array<[',' | ';' | '\t', number]>
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][1] > 0 ? entries[0][0] : ','
}

function parseDelimited(text: string): string[][] {
  const delimiter = detectDelimiter(text.slice(0, 2000))
  if (delimiter === ',') return parseCsv(text)
  return text
    .split(/\r?\n/)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.trim() !== ''))
}

function parseJsonComments(text: string): ParsedComment[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }

  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null
      ? Object.values(parsed).find(Array.isArray)
      : null

  if (!Array.isArray(list)) return null

  return list
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: String(index), text: item, raw: item }
      }
      if (typeof item !== 'object' || item === null) return null
      const record = item as Record<string, unknown>
      const textValue = TEXT_FIELDS.map((field) => record[field]).find(
        (value) => typeof value === 'string',
      )
      if (typeof textValue !== 'string') return null
      const username = USER_FIELDS.map((field) => record[field]).find(
        (value) => typeof value === 'string',
      )
      const timestamp = TIME_FIELDS.map((field) => record[field]).find(
        (value) => typeof value === 'string' || typeof value === 'number',
      )
      const replyTo = REPLY_FIELDS.map((field) => record[field]).find(
        (value) => typeof value === 'string' || typeof value === 'number',
      )
      return {
        id: String(index),
        username: typeof username === 'string' ? username : undefined,
        text: textValue,
        timestamp: timestamp === undefined ? undefined : String(timestamp),
        replyTo: replyTo === undefined ? undefined : String(replyTo),
        raw: JSON.stringify(record),
      }
    })
    .filter((item): item is ParsedComment => item !== null)
}

export function parseComments(input: string): ParseResult {
  const trimmed = input.trim()
  const warnings: string[] = []

  if (!trimmed) {
    return { comments: [], warnings: ['Input kosong.'], format: 'text' }
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const comments = parseJsonComments(trimmed)
    if (comments) {
      return { comments, warnings, format: 'json' }
    }
    warnings.push('JSON tidak valid, input diperlakukan sebagai teks.')
  }

  const rows = parseDelimited(trimmed)
  const firstRow = rows[0] ?? []
  const headers = firstRow.map(normalizeHeader)
  const textIndex = findField(headers, TEXT_FIELDS)
  const userIndex = findField(headers, USER_FIELDS)
  const timeIndex = findField(headers, TIME_FIELDS)
  const replyIndex = findField(headers, REPLY_FIELDS)

  const hasHeader = textIndex !== -1
  if (hasHeader) {
    const comments = rows
      .slice(1)
      .map((row, index) => {
        const text = row[textIndex]?.trim() ?? ''
        if (!text) return null
        return {
          id: String(index),
          username: userIndex >= 0 ? row[userIndex]?.trim() : undefined,
          text,
          timestamp: timeIndex >= 0 ? row[timeIndex]?.trim() : undefined,
          replyTo: replyIndex >= 0 ? row[replyIndex]?.trim() : undefined,
          raw: row.join(','),
        }
      })
      .filter(Boolean) as ParsedComment[]
    return { comments, warnings, format: 'csv' }
  }

  const comments = rows.map((row, index) => {
    if (row.length >= 4) {
      return {
        id: String(index),
        username: row[0]?.trim(),
        text: row[1]?.trim() ?? '',
        timestamp: row[2]?.trim(),
        replyTo: row[3]?.trim(),
        raw: row.join(','),
      }
    }
    if (row.length >= 3) {
      return {
        id: String(index),
        username: row[0]?.trim(),
        text: row[1]?.trim() ?? '',
        timestamp: row[2]?.trim(),
        raw: row.join(','),
      }
    }
    if (row.length === 2) {
      return {
        id: String(index),
        username: row[0]?.trim(),
        text: row[1]?.trim() ?? '',
        raw: row.join(','),
      }
    }
    return { id: String(index), text: row[0]?.trim() ?? '', raw: row[0] ?? '' }
  }).filter((item) => item.text.length > 0)

  return { comments, warnings, format: 'text' }
}
