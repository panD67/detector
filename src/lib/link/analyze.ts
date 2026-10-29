import { z } from 'zod'
import { safeExternalUrl, titleFromUrl, uid } from '../../lib/utils'
import { createAdapter } from '../ai/factory'
import { getCached, requestHash, setCached } from '../ai/cache'
import { fetchArticle } from './fetch'
import { extractArticle } from './extract'
import { normalizeUrl, hostnameFromUrl } from './url'
import {
  attributionScore,
  clickbaitScore,
  classifyPageType,
  domainReputation,
  emotionScore,
  titleBodyConsistency,
} from './heuristics'
import { computeLinkRisk, scoreBreakdown } from './score'
import { buildLinkPrompt, LINK_PROMPT_VERSION, LinkAiSchema } from './prompt'
import { isEvidenceGateMet, scoreCapForGate } from '../analysis/gate'
import { resolveConfidence } from '../analysis/confidence'
import { resolveStatus } from '../analysis/status'
import { loadSettings } from '../storage/settings'
import { saveHistory } from '../storage/history'
import { lookupFactChecks } from '../evidence/factcheck'
import { classifyFactCheckRating, classifyStanceFromText } from '../evidence/stance'
import type { AiProfile } from '../../types/analysis'
import type { AnalysisMode, LinkResult } from '../../types/analysis'

export interface LinkAnalysisInput {
  url: string
  mode: AnalysisMode
  context?: string
  manualText?: string
  profile: AiProfile
}

function extractJsonObject(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Respons AI tidak berisi JSON.')
  }
  return text.slice(start, end + 1)
}

function averageClaimRisk(claims: z.infer<typeof LinkAiSchema>['claims']): number {
  if (claims.length === 0) return 0.5
  const values = claims.map((claim) => {
    if (claim.assessment === 'supported') return 0.15
    if (claim.assessment === 'mixed') return 0.5
    if (claim.assessment === 'insufficient') return 0.65
    return 0.9
  })
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export async function analyzeLink(
  input: LinkAnalysisInput,
  onProgress?: (step: string, value: number) => void,
): Promise<LinkResult> {
  const startedAt = Date.now()
  onProgress?.('Memvalidasi URL', 5)

  const normalizedUrl = normalizeUrl(input.url)
  if (!normalizedUrl) {
    throw new Error('URL tidak valid. Gunakan format https://contoh.com/artikel.')
  }

  let extractedTitle = ''
  let extractedText = input.manualText?.trim() || ''
  let publishedAt = ''
  let fetchSource = 'manual'

  if (!extractedText) {
    onProgress?.('Mengambil artikel', 15)
    const fetched = await fetchArticle(normalizedUrl)
    fetchSource = fetched.source
    const extracted = extractArticle(fetched)
    extractedTitle = extracted.title
    extractedText = extracted.text
    publishedAt = extracted.publishedAt
  } else {
    fetchSource = 'manual'
  }

  if (extractedText.length < 200) {
    throw new Error('Konten terlalu pendek. Tempel teks manual minimal 200 karakter.')
  }

  onProgress?.('Mengekstrak fitur', 35)
  const hostname = hostnameFromUrl(normalizedUrl)
  const domain = domainReputation(hostname)
  const clickbait = clickbaitScore(extractedTitle)
  const emotion = emotionScore(extractedText)
  const attribution = attributionScore(extractedText)
  const consistency = titleBodyConsistency(extractedTitle, extractedText)
  const pageType = classifyPageType(normalizedUrl, extractedTitle, extractedText)

  onProgress?.('Memanggil AI', 55)
  const { system, user } = buildLinkPrompt({
    url: normalizedUrl,
    title: extractedTitle,
    text: extractedText,
    context: input.context,
    mode: input.mode,
  })

  const webSearch =
    input.mode !== 'fast' &&
    (input.profile.kind === 'gemini' ||
      input.profile.kind === 'openrouter' ||
      (input.profile.kind === 'custom' && (input.profile.baseUrl ?? '').includes('perplexity.ai')))
  const profileForAdapter =
    input.profile.kind === 'openrouter' && webSearch
      ? { ...input.profile, model: `${input.profile.model}:online` }
      : input.profile
  const adapter = createAdapter(profileForAdapter)

  const cacheKey = requestHash(input.profile.id, {
    system,
    user,
    webSearch,
    jsonMode: true,
  })

  let aiResponse = getCached(cacheKey)
  if (!aiResponse) {
    aiResponse = await adapter.analyze({
      system,
      user,
      webSearch,
      jsonMode: true,
      timeoutMs: 120_000,
    })
    setCached(cacheKey, aiResponse, input.profile ? 600_000 : 600_000)
  }

  let ai: z.infer<typeof LinkAiSchema>
  try {
    ai = LinkAiSchema.parse(JSON.parse(extractJsonObject(aiResponse.text)))
  } catch {
    const retryResponse = await adapter.analyze({
      system: `${system} Perbaiki JSON agar valid dan lengkap.`,
      user: `${user}\n\nRespons sebelumnya tidak valid. Ulangi dengan JSON yang benar.`,
      webSearch,
      jsonMode: true,
      timeoutMs: 120_000,
    })
    ai = LinkAiSchema.parse(JSON.parse(extractJsonObject(retryResponse.text)))
    aiResponse = retryResponse
    setCached(cacheKey, retryResponse)
  }

  onProgress?.('Mencari bukti eksternal', 70)
  const appSettings = loadSettings().settings
  const factCheckKey = appSettings.evidenceKeys.factCheck ?? ''
  const factCheckMatches =
    input.mode !== 'fast' && factCheckKey
      ? await Promise.all(
          ai.claims.slice(0, input.mode === 'deep' ? 5 : 3).map(async (claim) => {
            try {
              return await lookupFactChecks(claim.text, factCheckKey)
            } catch {
              return []
            }
          }),
        ).then((results) => results.flat())
      : []

  const webSources = (aiResponse.sources ?? []).map((source) => ({
    title: source.title,
    url: source.url,
    snippet: source.snippet,
    stance: classifyStanceFromText(`${source.title} ${source.snippet ?? ''}`),
    verified: false,
    quality: 'medium' as const,
  }))

  const factCheckSources = factCheckMatches.map((match) => ({
    title: match.publisher ? `${match.publisher}: ${match.claim}` : match.claim,
    url: match.url ?? '',
    snippet: match.rating,
    stance: classifyFactCheckRating(match.rating),
    verified: true,
    quality: 'high' as const,
  }))

  const combinedSources = [...webSources, ...factCheckSources].filter(
    (source) => !source.url || safeExternalUrl(source.url),
  )

  onProgress?.('Menghitung skor', 80)
  const externalSources = combinedSources.length
  const hasFactCheckRefutation = factCheckSources.some((source) => source.stance === 'refutes')
  const independentSignals = [
    domain.reputation < 0.45 || domain.reputation > 0.85,
    clickbait > 0.5,
    attribution < 0.4,
    emotion > 0.5,
    consistency < 0.4,
    ai.aiAssessment > 0.6,
    externalSources > 0,
    hasFactCheckRefutation,
  ].filter(Boolean).length

  const features = {
    domainRisk: 1 - domain.reputation,
    pageTypeRisk:
      pageType === 'fact-check'
        ? 0.1
        : pageType === 'satire'
          ? 0.45
          : pageType === 'opinion'
            ? 0.35
            : pageType === 'promotion'
              ? 0.75
              : pageType === 'forum'
                ? 0.55
                : pageType === 'news'
                  ? 0.45
                  : 0.6,
    claimSupportRisk: averageClaimRisk(ai.claims),
    stanceConsistencyRisk: Math.max(0, 1 - consistency - (externalSources > 1 ? 0.15 : 0)),
    internalStyleRisk: Math.min(1, (clickbait + emotion) / 2),
    recencyRisk: publishedAt ? 0.2 : 0.6,
    mediaProvenanceRisk: 0.5,
    aiAssessmentRisk: ai.aiAssessment,
  }

  let score = computeLinkRisk(features)
  const gateMet = isEvidenceGateMet({
    type: 'link',
    independentSignals,
    externalSources,
    strongSourceMatch: hasFactCheckRefutation || (pageType === 'fact-check' && externalSources > 0),
  })
  const cap = scoreCapForGate('link', gateMet)
  if (cap !== null) score = Math.min(score, cap)

  const confidence = resolveConfidence({
    independentSignals,
    externalSources,
    agreement: externalSources > 1 ? 0.72 : externalSources === 1 ? 0.55 : 0.45,
    providerSupportsSearch: webSearch,
    contradictions: 0,
  })

  const status = resolveStatus({
    score,
    confidence,
    gateMet,
  })

  const evidence = combinedSources.map((source) => ({
    id: uid(),
    title: source.title,
    url: source.url || undefined,
    publisher: source.url ? titleFromUrl(source.url) : source.title,
    retrievedAt: new Date().toISOString(),
    quality: source.quality,
    stance: source.stance,
    quote: source.snippet,
    verified: source.verified,
  }))

  const findings = ai.findings.map((finding) => ({
    id: uid(),
    title: finding.title,
    detail: finding.detail,
    severity: finding.severity,
  }))

  if (clickbait > 0.5) {
    findings.unshift({
      id: uid(),
      title: 'Judul mengandung pola clickbait',
      detail: 'Judul memakai kata pemicu atau format yang sering dipakai untuk menarik klik.',
      severity: 'medium',
    })
  }

  const limitations = [...ai.limitations]
  if (externalSources === 0) {
    limitations.push('Tidak ada bukti eksternal yang ditemukan. Keyakinan dibatasi.')
  }
  if (fetchSource !== 'direct') {
    limitations.push(`Artikel diambil melalui ${fetchSource}. Beberapa elemen mungkin tidak terbaca.`)
  }
  if (extractedText.length < 800) {
    limitations.push('Konten artikel pendek, sehingga analisis klaim terbatas.')
  }

  const result: LinkResult = {
    id: uid(),
    type: 'link',
    createdAt: new Date().toISOString(),
    status,
    score,
    confidence,
    title: extractedTitle || 'Artikel tanpa judul',
    subtitle: hostname,
    summary: ai.summary,
    breakdown: scoreBreakdown(features),
    findings,
    recommendations: ai.recommendations,
    limitations,
    evidence,
    meta: {
      mode: input.mode,
      providerId: input.profile.id,
      providerLabel: input.profile.name,
      model: input.profile.model,
      promptVersion: LINK_PROMPT_VERSION,
      calibrationVersion: 'link-weights-2026.1',
      durationMs: Date.now() - startedAt,
      aiUsed: true,
      evidenceUsed: externalSources > 0,
    },
    url: normalizedUrl,
    domain: hostname,
    excerpt: extractedText.slice(0, 280),
    wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    claims: ai.claims.map((claim) => ({
      id: uid(),
      text: claim.text,
      assessment: claim.assessment,
      explanation: claim.explanation,
      evidenceIds: evidence.map((item) => item.id),
    })),
  }

  onProgress?.('Menyimpan riwayat', 95)
  try {
    await saveHistory(result)
  } catch {
    // History storage is not critical to returning the result.
  }
  onProgress?.('Selesai', 100)
  return result
}
