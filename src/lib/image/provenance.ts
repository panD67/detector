export async function detectC2pa(file: File): Promise<boolean> {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(bytes.length, 2_000_000)))
    return /c2pa|jumbf|contentcredentials/i.test(text)
  } catch {
    return false
  }
}

export interface ReverseSearchMatch {
  title: string
  url: string
  snippet?: string
}

export async function reverseImageSearch(
  imageUrl: string,
  apiKey: string,
): Promise<ReverseSearchMatch[]> {
  if (!imageUrl.trim() || !apiKey.trim()) return []
  const url = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(
    imageUrl,
  )}&api_key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Reverse search mengembalikan ${response.status}.`)
  const data = (await response.json()) as {
    image_results?: Array<{ title?: string; link?: string; snippet?: string }>
  }
  return (data.image_results ?? []).map((item) => ({
    title: item.title ?? 'Hasil reverse search',
    url: item.link ?? '',
    snippet: item.snippet,
  })).filter((item) => item.url)
}
