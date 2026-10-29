import type { AnalysisType } from '../../types/analysis'

export interface EvidenceGateInput {
  type: AnalysisType
  independentSignals: number
  externalSources: number
  sampleSize?: number
  strongSourceMatch?: boolean
  detectorConfidence?: number
  provenanceContradiction?: boolean
}

export function isEvidenceGateMet(input: EvidenceGateInput): boolean {
  if (input.type === 'link') {
    return input.strongSourceMatch === true || input.independentSignals >= 2
  }

  if (input.type === 'comment') {
    return (input.sampleSize ?? 0) >= 30 && input.independentSignals >= 3
  }

  return (
    input.strongSourceMatch === true ||
    input.provenanceContradiction === true ||
    (input.detectorConfidence ?? 0) >= 0.9 ||
    input.externalSources >= 2
  )
}

export function scoreCapForGate(
  type: AnalysisType,
  gateMet: boolean,
): number | null {
  if (gateMet) return null
  if (type === 'link') return 60
  if (type === 'comment') return 65
  return 65
}
