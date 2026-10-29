export interface CommentFeatures {
  duplicateRisk: number
  burstRisk: number
  concentrationRisk: number
  spamRisk: number
  lexicalRisk: number
  metadataRisk: number
  networkRisk: number
  aiAssessmentRisk: number
}

const BASE_WEIGHTS = {
  duplicateRisk: 0.25,
  burstRisk: 0.18,
  concentrationRisk: 0.15,
  metadataRisk: 0.14,
  lexicalRisk: 0.10,
  networkRisk: 0.10,
  spamRisk: 0.08,
  aiAssessmentRisk: 0.06,
}

export function normalizeWeights(features: CommentFeatures): Record<keyof CommentFeatures, number> {
  const available: Record<keyof CommentFeatures, boolean> = {
    duplicateRisk: true,
    burstRisk: features.burstRisk > 0,
    concentrationRisk: true,
    spamRisk: true,
    lexicalRisk: true,
    metadataRisk: features.metadataRisk !== 0.5,
    networkRisk: features.networkRisk > 0,
    aiAssessmentRisk: features.aiAssessmentRisk >= 0,
  }

  const weights = { ...BASE_WEIGHTS }
  let total = 0
  for (const key of Object.keys(weights) as Array<keyof CommentFeatures>) {
    if (!available[key]) weights[key] = 0
    total += weights[key]
  }
  if (total === 0) return weights
  for (const key of Object.keys(weights) as Array<keyof CommentFeatures>) {
    weights[key] = weights[key] / total
  }
  return weights
}

export function computeCommentRisk(features: CommentFeatures): number {
  const weights = normalizeWeights(features)
  let z = -1.1
  for (const key of Object.keys(weights) as Array<keyof CommentFeatures>) {
    z += weights[key] * features[key]
  }
  return Math.round((1 / (1 + Math.exp(-z))) * 100)
}

export function commentScoreBreakdown(features: CommentFeatures) {
  const weights = normalizeWeights(features)
  const labels: Record<keyof CommentFeatures, string> = {
    duplicateRisk: 'Duplikasi dan near-duplicate',
    burstRisk: 'Burst waktu',
    concentrationRisk: 'Konsentrasi hashtag, mention, URL',
    spamRisk: 'Spam dan promosi',
    lexicalRisk: 'Variasi leksikal dan template',
    metadataRisk: 'Metadata akun',
    networkRisk: 'Pola jaringan balasan',
    aiAssessmentRisk: 'Penilaian AI terstruktur',
  }
  return (Object.keys(weights) as Array<keyof CommentFeatures>).map((key) => ({
    key,
    label: labels[key],
    score: Math.round(features[key] * 100),
    weight: weights[key],
    detail: `Fitur risiko ${labels[key].toLowerCase()}.`,
    available: weights[key] > 0,
  }))
}
