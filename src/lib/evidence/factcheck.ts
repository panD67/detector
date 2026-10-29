export interface FactCheckMatch {
  claim: string
  claimant?: string
  rating: string
  publisher?: string
  url?: string
  reviewDate?: string
}

export async function lookupFactChecks(
  query: string,
  apiKey: string,
): Promise<FactCheckMatch[]> {
  if (!apiKey.trim() || !query.trim()) return []
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
    query.slice(0, 300),
  )}&key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Fact Check API mengembalikan ${response.status}.`)
  }
  const data = (await response.json()) as {
    claims?: Array<{
      text?: string
      claimant?: string
      claimReview?: Array<{
        publisher?: { name?: string; site?: string }
        url?: string
        textualRating?: string
        reviewDate?: string
      }>
    }>
  }
  const matches: FactCheckMatch[] = []
  for (const claim of data.claims ?? []) {
    for (const review of claim.claimReview ?? []) {
      matches.push({
        claim: claim.text ?? query,
        claimant: claim.claimant,
        rating: review.textualRating ?? 'Tidak diketahui',
        publisher: review.publisher?.name ?? review.publisher?.site,
        url: review.url,
        reviewDate: review.reviewDate,
      })
    }
  }
  return matches
}
