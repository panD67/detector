import type { ConfidenceLevel } from '../../types/analysis'

export interface ConfidenceInput {
  independentSignals: number
  externalSources: number
  agreement: number
  providerSupportsSearch: boolean
  sampleSize?: number
  contradictions?: number
}

export function resolveConfidence(input: ConfidenceInput): ConfidenceLevel {
  const contradictions = input.contradictions ?? 0

  if (input.sampleSize !== undefined && input.sampleSize < 10) {
    return 'low'
  }

  const sampleCapsAtMedium =
    input.sampleSize !== undefined && input.sampleSize < 30

  if (
    input.independentSignals >= 3 &&
    input.externalSources >= 1 &&
    input.agreement >= 0.7 &&
    input.providerSupportsSearch &&
    contradictions === 0
  ) {
    return sampleCapsAtMedium ? 'medium' : 'high'
  }

  if (
    (input.independentSignals >= 2 && input.agreement >= 0.5) ||
    (input.externalSources >= 1 && input.independentSignals >= 1)
  ) {
    return 'medium'
  }

  return 'low'
}
