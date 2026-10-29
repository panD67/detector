export function classifyStanceFromText(text: string): 'supports' | 'refutes' | 'insufficient' | 'irrelevant' {
  const lower = text.toLowerCase()
  if (/(hoaks?|hoax|salah|palsu|misinformasi|disinformasi|tidak benar|false)/.test(lower)) {
    return 'refutes'
  }
  if (/(benar|terkonfirmasi|akurat|true|verified)/.test(lower)) {
    return 'supports'
  }
  if (/(tidak cukup|belum jelas|unclear|insufficient)/.test(lower)) {
    return 'insufficient'
  }
  return 'insufficient'
}

export function classifyFactCheckRating(rating: string): 'supports' | 'refutes' | 'insufficient' {
  const lower = rating.toLowerCase()
  if (/(false|salah|hoax|hoaks|misleading|palsu)/.test(lower)) return 'refutes'
  if (/(true|benar|accurate|correct)/.test(lower)) return 'supports'
  return 'insufficient'
}

export function verifyQuote(quote: string | undefined, sourceText: string): boolean {
  if (!quote || !sourceText) return false
  const normalizedQuote = quote.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalizedSource = sourceText.toLowerCase().replace(/\s+/g, ' ')
  if (normalizedSource.includes(normalizedQuote)) return true
  const quoteTokens = new Set(normalizedQuote.split(' ').filter((token) => token.length > 3))
  if (quoteTokens.size === 0) return false
  let matches = 0
  for (const token of quoteTokens) {
    if (normalizedSource.includes(token)) matches += 1
  }
  return matches / quoteTokens.size >= 0.75
}
