export interface FetchedArticle {
  html: string
  text: string
  source: 'direct' | 'jina' | 'allorigins' | 'codetabs'
  finalUrl: string
}

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  controller.signal.addEventListener('abort', () => clearTimeout(timeout), { once: true })
  return controller.signal
}

async function tryDirect(url: string, signal?: AbortSignal): Promise<FetchedArticle | null> {
  try {
    const response = await fetch(url, {
      signal: withTimeout(signal, 15_000),
      headers: { Accept: 'text/html,application/xhtml+xml' },
    })
    if (!response.ok) return null
    const html = await response.text()
    if (html.length < 200) return null
    return { html, text: '', source: 'direct', finalUrl: response.url || url }
  } catch {
    return null
  }
}

async function tryJina(url: string, signal?: AbortSignal): Promise<FetchedArticle | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      signal: withTimeout(signal, 20_000),
      headers: { Accept: 'text/plain' },
    })
    if (!response.ok) return null
    const text = await response.text()
    if (text.length < 200) return null
    return { html: '', text, source: 'jina', finalUrl: url }
  } catch {
    return null
  }
}

async function tryAllOrigins(url: string, signal?: AbortSignal): Promise<FetchedArticle | null> {
  try {
    const response = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      { signal: withTimeout(signal, 20_000) },
    )
    if (!response.ok) return null
    const data = (await response.json()) as { contents?: string }
    if (!data.contents || data.contents.length < 200) return null
    return { html: data.contents, text: '', source: 'allorigins', finalUrl: url }
  } catch {
    return null
  }
}

async function tryCodetabs(url: string, signal?: AbortSignal): Promise<FetchedArticle | null> {
  try {
    const response = await fetch(
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      { signal: withTimeout(signal, 20_000) },
    )
    if (!response.ok) return null
    const html = await response.text()
    if (html.length < 200) return null
    return { html, text: '', source: 'codetabs', finalUrl: url }
  } catch {
    return null
  }
}

export async function fetchArticle(
  url: string,
  signal?: AbortSignal,
): Promise<FetchedArticle> {
  const attempts = [tryDirect, tryJina, tryAllOrigins, tryCodetabs]
  for (const attempt of attempts) {
    const result = await attempt(url, signal)
    if (result) return result
  }
  throw new Error('Semua metode pengambilan artikel gagal.')
}
