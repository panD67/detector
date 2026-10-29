const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'igshid',
])

export function normalizeUrl(input: string): string | null {
  let value = input.trim()
  if (!value) return null
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null

    for (const param of url.searchParams.keys()) {
      if (TRACKING_PARAMS.has(param.toLowerCase()) || param.toLowerCase().startsWith('utm_')) {
        url.searchParams.delete(param)
      }
    }
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}
