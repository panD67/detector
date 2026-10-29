import { uid } from '../../lib/utils'
import { createAdapter } from '../ai/factory'
import { getCached, requestHash, setCached } from '../ai/cache'
import { parseComments } from './parser'
import { normalizeComment } from './normalize'
import { findDuplicates } from './dedup'
import { computeCommentStats } from './stats'
import { computeCommentRisk, commentScoreBreakdown } from './score'
import { buildCommentPrompt, COMMENT_PROMPT_VERSION, CommentAiSchema } from './prompt'
import { isEvidenceGateMet, scoreCapForGate } from '../analysis/gate'
import { resolveConfidence } from '../analysis/confidence'
import { resolveStatus } from '../analysis/status'
import { saveHistory } from '../storage/history'
import type { AiProfile } from '../../types/analysis'
import type { AnalysisMode, CommentResult } from '../../types/analysis'

export interface CommentAnalysisInput {
  input: string
  mode: AnalysisMode
  profile?: AiProfile
}

function extractJsonObject(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('Respons AI tidak berisi JSON.')
  return text.slice(start, end + 1)
}

export async function analyzeComments(
  input: CommentAnalysisInput,
  onProgress?: (step: string, value: number) => void,
): Promise<CommentResult> {
  const startedAt = Date.now()
  onProgress?.('Mem-parse input', 10)
  const parsed = parseComments(input.input)
  if (parsed.comments.length === 0) {
    throw new Error('Tidak ada komentar yang bisa dianalisis.')
  }

  onProgress?.('Normalisasi dan deduplikasi', 30)
  const normalized = parsed.comments.map((comment) => ({
    ...comment,
    normalized: normalizeComment(comment.text),
    tokens: normalizeComment(comment.text).split(/\s+/).filter(Boolean),
  }))

  const exactMap = new Map<string, string[]>()
  for (const comment of normalized) {
    const group = exactMap.get(comment.normalized)
    if (group) group.push(comment.id)
    else exactMap.set(comment.normalized, [comment.id])
  }
  const exactDuplicateCount = [...exactMap.values()].reduce(
    (sum, group) => sum + Math.max(0, group.length - 1),
    0,
  )

  const { nearClusters } = findDuplicates(normalized)
  const nearDuplicateCount = nearClusters.reduce((sum, cluster) => sum + Math.max(0, cluster.ids.length - 1), 0)
  const duplicateCount = exactDuplicateCount + nearDuplicateCount

  const stats = computeCommentStats(parsed.comments, duplicateCount)

  onProgress?.('Menganalisis pola', 55)
  let aiAssessment = 0.45
  let summary = 'Analisis heuristik selesai. Tidak ada profil AI aktif untuk penjelasan tambahan.'
  let findings: CommentResult['findings'] = []
  let recommendations = ['Periksa klaster duplikat dan pola waktu sebelum menyimpulkan koordinasi.']
  let limitations = ['Analisis ini agregat dan tidak menuduh akun individu.']

  if (input.profile) {
    const adapter = createAdapter(input.profile)
    const prompt = buildCommentPrompt({
      stats: {
        total: stats.total,
        unique: stats.unique,
        duplicatePercent: stats.duplicatePercent,
        spamPercent: stats.spamPercent,
        timestampCount: stats.timestampCount,
        burstScore: stats.burstScore,
        concentrationScore: stats.concentrationScore,
        lexicalVariety: stats.lexicalVariety,
      },
      samples: parsed.comments.map((comment) => comment.text),
      mode: input.mode,
    })
    const cacheKey = requestHash(input.profile.id, {
      system: prompt.system,
      user: prompt.user,
      jsonMode: true,
    })
    let response = getCached(cacheKey)
    if (!response) {
      response = await adapter.analyze({
        system: prompt.system,
        user: prompt.user,
        jsonMode: true,
        timeoutMs: 120_000,
      })
      setCached(cacheKey, response)
    }
    try {
      const ai = CommentAiSchema.parse(JSON.parse(extractJsonObject(response.text)))
      aiAssessment = ai.aiAssessment
      summary = ai.summary
      findings = ai.findings.map((finding) => ({
        id: uid(),
        title: finding.title,
        detail: finding.detail,
        severity: finding.severity,
      }))
      recommendations = ai.recommendations
      limitations = ai.limitations
    } catch {
      findings = [
        {
          id: uid(),
          title: 'Respons AI tidak valid',
          detail: 'Hasil heuristik tetap ditampilkan. Coba ulang atau ganti provider.',
          severity: 'medium',
        },
      ]
    }
  }

  onProgress?.('Menghitung skor', 80)
  const independentSignals = [
    stats.duplicatePercent >= 20,
    stats.burstScore >= 0.35,
    stats.concentrationScore >= 0.5,
    stats.spamPercent >= 10,
    stats.lexicalVariety <= 0.45,
    stats.timestampCount >= 5,
  ].filter(Boolean).length

  const features = {
    duplicateRisk: Math.min(1, stats.duplicatePercent / 100),
    burstRisk: stats.burstScore,
    concentrationRisk: stats.concentrationScore,
    spamRisk: Math.min(1, stats.spamPercent / 100),
    lexicalRisk: Math.max(0, 1 - stats.lexicalVariety),
    metadataRisk: stats.accountRisk,
    networkRisk: stats.networkRisk,
    aiAssessmentRisk: aiAssessment,
  }

  let score = computeCommentRisk(features)
  const gateMet = isEvidenceGateMet({
    type: 'comment',
    independentSignals,
    externalSources: input.profile ? 1 : 0,
    sampleSize: stats.total,
  })
  const cap = scoreCapForGate('comment', gateMet)
  if (cap !== null) score = Math.min(score, cap)

  const confidence = resolveConfidence({
    independentSignals,
    externalSources: input.profile ? 1 : 0,
    agreement: 0.6,
    providerSupportsSearch: false,
    sampleSize: stats.total,
    contradictions: 0,
  })

  const status = resolveStatus({ score, confidence, gateMet })

  const result: CommentResult = {
    id: uid(),
    type: 'comment',
    createdAt: new Date().toISOString(),
    status,
    score,
    confidence,
    title: 'Analisis komentar',
    subtitle: `${stats.total} komentar`,
    summary,
    breakdown: commentScoreBreakdown(features),
    findings,
    recommendations,
    limitations,
    evidence: [],
    meta: {
      mode: input.mode,
      providerId: input.profile?.id,
      providerLabel: input.profile?.name,
      model: input.profile?.model,
      promptVersion: COMMENT_PROMPT_VERSION,
      calibrationVersion: 'comment-weights-2026.1',
      durationMs: Date.now() - startedAt,
      aiUsed: Boolean(input.profile),
      evidenceUsed: false,
    },
    totalComments: stats.total,
    uniqueComments: stats.unique,
    duplicatePercent: stats.duplicatePercent,
    spamPercent: stats.spamPercent,
    duplicateSamples: [...exactMap.values()].filter((group) => group.length > 1).slice(0, 8),
  }

  onProgress?.('Menyimpan riwayat', 95)
  try {
    await saveHistory(result)
  } catch {
    // Storage failure should not block result.
  }
  onProgress?.('Selesai', 100)
  return result
}
