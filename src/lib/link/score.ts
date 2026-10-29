export interface LinkFeatures {
  domainRisk: number
  pageTypeRisk: number
  claimSupportRisk: number
  stanceConsistencyRisk: number
  internalStyleRisk: number
  recencyRisk: number
  mediaProvenanceRisk: number
  aiAssessmentRisk: number
}

const WEIGHTS: Record<keyof LinkFeatures, number> = {
  domainRisk: 0.16,
  pageTypeRisk: 0.10,
  claimSupportRisk: 0.22,
  stanceConsistencyRisk: 0.20,
  internalStyleRisk: 0.10,
  recencyRisk: 0.08,
  mediaProvenanceRisk: 0.08,
  aiAssessmentRisk: 0.06,
}

const BIAS = -1.15

export function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value))
}

export function computeLinkRisk(features: LinkFeatures): number {
  let z = BIAS
  for (const key of Object.keys(WEIGHTS) as Array<keyof LinkFeatures>) {
    z += WEIGHTS[key] * features[key]
  }
  return Math.round(sigmoid(z) * 100)
}

export function scoreBreakdown(features: LinkFeatures): Array<{
  key: string
  label: string
  score: number
  weight: number
  detail: string
  available: boolean
}> {
  const labels: Record<keyof LinkFeatures, string> = {
    domainRisk: 'Reputasi domain',
    pageTypeRisk: 'Tipe halaman',
    claimSupportRisk: 'Dukungan klaim',
    stanceConsistencyRisk: 'Konsistensi sumber',
    internalStyleRisk: 'Gaya internal',
    recencyRisk: 'Konteks waktu',
    mediaProvenanceRisk: 'Provenance media',
    aiAssessmentRisk: 'Penilaian AI terstruktur',
  }
  return (Object.keys(WEIGHTS) as Array<keyof LinkFeatures>).map((key) => ({
    key,
    label: labels[key],
    score: Math.round(features[key] * 100),
    weight: WEIGHTS[key],
    detail: `Fitur risiko ${labels[key].toLowerCase()}.`,
    available: true,
  }))
}
