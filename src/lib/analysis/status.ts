import type {
  AnalysisStatus,
  ConfidenceLevel,
  RiskLevel,
} from '../../types/analysis'
import { clamp } from '../utils'

export const statusMeta: Record<
  AnalysisStatus,
  {
    label: string
    shortLabel: string
    description: string
    tone: RiskLevel | 'neutral'
  }
> = {
  'no-strong-indication': {
    label: 'Tidak ada indikasi kuat',
    shortLabel: 'Rendah',
    description:
      'Tidak ditemukan pola risiko yang menonjol. Tetap periksa sumber primer sebelum mengambil keputusan.',
    tone: 'low',
  },
  'needs-verification': {
    label: 'Perlu verifikasi',
    shortLabel: 'Sedang',
    description:
      'Ada sinyal yang perlu dicek, tetapi bukti belum cukup untuk menyimpulkan. Periksa tautan dan kutipan di bagian bukti.',
    tone: 'medium',
  },
  'strong-indication': {
    label: 'Indikasi kuat',
    shortLabel: 'Tinggi',
    description:
      'Ada kombinasi bukti atau sinyal kuat. Jangan sebarkan sebelum memeriksa sumber primer dan konteks asli.',
    tone: 'high',
  },
  unverifiable: {
    label: 'Tidak dapat diverifikasi',
    shortLabel: 'Tidak pasti',
    description:
      'Aplikasi tidak punya data atau bukti yang cukup untuk menilai. Ini bukan berarti konten aman.',
    tone: 'neutral',
  },
}

export function riskLevelFromScore(score: number): RiskLevel {
  const value = clamp(score)
  if (value >= 60) return 'high'
  if (value >= 30) return 'medium'
  return 'low'
}

export interface StatusInput {
  score: number
  confidence: ConfidenceLevel
  gateMet: boolean
  unverifiable?: boolean
}

export function resolveStatus(input: StatusInput): AnalysisStatus {
  if (input.unverifiable) return 'unverifiable'

  const score = clamp(input.score)

  if (score >= 60 && input.gateMet && input.confidence !== 'low') {
    return 'strong-indication'
  }

  if (score >= 30) return 'needs-verification'

  if (input.confidence === 'low') return 'needs-verification'

  return 'no-strong-indication'
}
