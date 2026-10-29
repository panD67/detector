export interface ImageFeatures {
  reverseSearchRisk: number
  c2paRisk: number
  aiDetectorRisk: number
  exifRisk: number
  claimConsistencyRisk: number
  visualArtifactRisk: number
}

const BASE_WEIGHTS: Record<keyof ImageFeatures, number> = {
  reverseSearchRisk: 0.30,
  c2paRisk: 0.18,
  aiDetectorRisk: 0.20,
  exifRisk: 0.10,
  claimConsistencyRisk: 0.12,
  visualArtifactRisk: 0.10,
}

export function normalizeImageWeights(_features: ImageFeatures, available: Record<keyof ImageFeatures, boolean>) {
  const weights = { ...BASE_WEIGHTS }
  let total = 0
  for (const key of Object.keys(weights) as Array<keyof ImageFeatures>) {
    if (!available[key]) weights[key] = 0
    total += weights[key]
  }
  if (total === 0) return weights
  for (const key of Object.keys(weights) as Array<keyof ImageFeatures>) {
    weights[key] /= total
  }
  return weights
}

export function computeImageRisk(features: ImageFeatures, available: Record<keyof ImageFeatures, boolean>): number {
  const weights = normalizeImageWeights(features, available)
  let z = -1.05
  for (const key of Object.keys(weights) as Array<keyof ImageFeatures>) {
    z += weights[key] * features[key]
  }
  return Math.round((1 / (1 + Math.exp(-z))) * 100)
}

export function imageScoreBreakdown(features: ImageFeatures, available: Record<keyof ImageFeatures, boolean>) {
  const weights = normalizeImageWeights(features, available)
  const labels: Record<keyof ImageFeatures, string> = {
    reverseSearchRisk: 'Kecocokan reverse search',
    c2paRisk: 'Provenance C2PA',
    aiDetectorRisk: 'Detector AI generatif',
    exifRisk: 'Metadata EXIF dan software',
    claimConsistencyRisk: 'Konsistensi klaim OCR',
    visualArtifactRisk: 'Artefak visual dari model',
  }
  return (Object.keys(weights) as Array<keyof ImageFeatures>).map((key) => ({
    key,
    label: labels[key],
    score: Math.round(features[key] * 100),
    weight: weights[key],
    detail: `Fitur risiko ${labels[key].toLowerCase()}.`,
    available: available[key],
  }))
}
