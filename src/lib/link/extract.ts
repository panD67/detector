export interface ExtractedArticle {
  title: string
  author: string
  publishedAt: string
  canonical: string
  text: string
  imageUrl: string
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function fromHtml(html: string, url: string): ExtractedArticle {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="title"]')?.getAttribute('content') ||
    doc.querySelector('title')?.textContent ||
    ''

  const author =
    doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
    ''

  const publishedAt =
    doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="pubdate"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="date"]')?.getAttribute('content') ||
    ''

  const canonical =
    doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ||
    url

  const imageUrl =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''

  const container =
    doc.querySelector('article') ||
    doc.querySelector('main') ||
    doc.querySelector('[role="main"]') ||
    doc.body

  const paragraphs = Array.from(container.querySelectorAll('p'))
    .map((node) => cleanText(node.textContent || ''))
    .filter((text) => text.length > 40)

  const text = paragraphs.join('\n\n') || cleanText(container.textContent || '')

  return {
    title: cleanText(title),
    author: cleanText(author),
    publishedAt: cleanText(publishedAt),
    canonical: cleanText(canonical),
    text,
    imageUrl: cleanText(imageUrl),
  }
}

function fromText(text: string, url: string): ExtractedArticle {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const title = lines.find((line) => line.startsWith('#'))?.replace(/^#+\s*/, '') || lines[0] || ''
  const body = lines.filter((line) => !line.startsWith('#')).join('\n\n')
  return {
    title: cleanText(title).slice(0, 240),
    author: '',
    publishedAt: '',
    canonical: url,
    text: cleanText(body) || cleanText(text),
    imageUrl: '',
  }
}

export function extractArticle(input: { html: string; text: string; finalUrl: string }): ExtractedArticle {
  if (input.text && input.text.length > input.html.length) {
    return fromText(input.text, input.finalUrl)
  }
  if (input.html) {
    return fromHtml(input.html, input.finalUrl)
  }
  return fromText(input.text, input.finalUrl)
}
