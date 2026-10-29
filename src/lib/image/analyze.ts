import { uid } from '../../lib/utils'
import { createAdapter } from '../ai/factory'
import { getCached, requestHash, setCached } from '../ai/cache'
import { createThumbnail, sha256File } from './hash'
import { readExif } from './exif'
import { detectC2pa, reverseImageSearch } from './provenance'
import { runOcr } from './ocr'
import { buildImagePrompt, IMAGE_PROMPT_VERSION, ImageAiSchema } from './prompt'
import { computeImageRisk, imageScoreBreakdown } from './score'
import { isEvidenceGateMet, scoreCapForGate } from '../analysis/gate'
import { resolveConfidence } from '../analysis/confidence'
import { resolveStatus } from '../analysis/status'
import { saveHistory } from '../storage/history'
import type { AiProfile } from '../../types/analysis'
import type { AnalysisMode, ImageResult } from '../../types/analysis'

export interface ImageAnalysisInput {
  file: File
  mode: AnalysisMode
  context?: string
  ocrEnabled: boolean
  profile?: AiProfile
  imageUrl?: string
  reverseSearchKey?: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.readAsDataURL(file)
  })
}

function extractJsonObject(text: string): string {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('Respons AI tidak berisi JSON.')
  return text.slice(start, end + 1)
}

export async function analyzeImage(
  input: ImageAnalysisInput,
  onProgress?: (step: string, value: number) => void,
): Promise<ImageResult> {
  const startedAt = Date.now()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.file.type)) {
    throw new Error('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.')
  }
  if (input.file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran file melebihi 10 MB.')
  }

  onProgress?.('Membaca file', 10)
  const fileHash = await sha256File(input.file)
  const preview = await createThumbnail(input.file)
  const exif = await readExif(input.file)
  const c2paDetected = await detectC2pa(input.file)
  let reverseMatches: Awaited<ReturnType<typeof reverseImageSearch>> = []
  if (input.imageUrl && input.reverseSearchKey) {
    onProgress?.('Reverse image search', 45)
    try {
      reverseMatches = await reverseImageSearch(input.imageUrl, input.reverseSearchKey)
    } catch {
      reverseMatches = []
    }
  }

  let ocrText = ''
  if (input.ocrEnabled) {
    onProgress?.('Menjalankan OCR lokal', 25)
    try {
      ocrText = await runOcr(input.file, (value) => onProgress?.('OCR', 25 + value * 0.2))
    } catch {
      ocrText = ''
    }
  }

  onProgress?.('Menganalisis dengan AI', 55)
  let aiAssessment = 0.45
  let aiGeneratedLikelihood: number | null = null
  let summary = 'Analisis lokal selesai. AI vision tidak tersedia atau tidak dijalankan.'
  let findings: ImageResult['findings'] = []
  let recommendations = ['Lakukan reverse image search manual untuk memastikan konteks asli.']
  let limitations = ['Reverse search, C2PA, dan detector khusus belum tersedia pada v1.']
  let ocrConsistency = 0.5
  let visualArtifactRisk = 0.4

  if (input.profile?.visionModel || input.profile?.model) {
    const adapter = createAdapter(input.profile)
    if (adapter.supportsVision) {
      const base64 = await fileToBase64(input.file)
      const prompt = buildImagePrompt({
        context: input.context,
        ocrText,
        exif,
        mode: input.mode,
      })
      const cacheKey = requestHash(input.profile.id, {
        system: prompt.system,
        user: `${prompt.user}:${fileHash}`,
        images: [{ mimeType: input.file.type, data: base64 }],
        jsonMode: true,
      })
      let response = getCached(cacheKey)
      if (!response) {
        response = await adapter.analyze({
          system: prompt.system,
          user: prompt.user,
          images: [{ mimeType: input.file.type, data: base64 }],
          jsonMode: true,
          timeoutMs: 180_000,
        })
        setCached(cacheKey, response)
      }
      try {
        const ai = ImageAiSchema.parse(JSON.parse(extractJsonObject(response.text)))
        aiAssessment = ai.aiAssessment
        aiGeneratedLikelihood = ai.aiGeneratedLikelihood
        summary = ai.summary
        findings = ai.findings.map((finding) => ({
          id: uid(),
          title: finding.title,
          detail: finding.detail,
          severity: finding.severity,
        }))
        recommendations = ai.recommendations
        limitations = ai.limitations
        ocrConsistency = ai.ocrConsistency
        visualArtifactRisk = ai.visualArtifactRisk
      } catch {
        findings = [
          {
            id: uid(),
            title: 'Respons AI tidak valid',
            detail: 'Hasil lokal tetap ditampilkan. Coba ulang atau ganti provider.',
            severity: 'medium',
          },
        ]
      }
    }
  }

  onProgress?.('Menghitung skor', 85)
  const hasExif = Object.keys(exif).length > 0
  const features = {
    reverseSearchRisk: reverseMatches.length > 0 ? 0.85 : input.reverseSearchKey ? 0.35 : 0.5,
    c2paRisk: c2paDetected ? 0.1 : 0.45,
    aiDetectorRisk: aiGeneratedLikelihood ?? aiAssessment,
    exifRisk: hasExif ? 0.15 : 0.35,
    claimConsistencyRisk: 1 - ocrConsistency,
    visualArtifactRisk,
  }
  const available = {
    reverseSearchRisk: Boolean(input.reverseSearchKey),
    c2paRisk: true,
    aiDetectorRisk: aiGeneratedLikelihood !== null || Boolean(input.profile),
    exifRisk: true,
    claimConsistencyRisk: ocrText.length > 0 || Boolean(input.context),
    visualArtifactRisk: Boolean(input.profile),
  }

  const independentSignals = [
    hasExif,
    ocrText.length > 20,
    Boolean(input.context),
    aiGeneratedLikelihood !== null,
    c2paDetected,
    reverseMatches.length > 0,
  ].filter(Boolean).length

  let score = computeImageRisk(features, available)
  const gateMet = isEvidenceGateMet({
    type: 'image',
    independentSignals,
    externalSources: reverseMatches.length,
    detectorConfidence: aiGeneratedLikelihood ?? undefined,
    strongSourceMatch: reverseMatches.length > 0,
    provenanceContradiction: false,
  })
  const cap = scoreCapForGate('image', gateMet)
  if (cap !== null) score = Math.min(score, cap)

  const confidence = resolveConfidence({
    independentSignals,
    externalSources: reverseMatches.length,
    agreement: reverseMatches.length > 0 ? 0.7 : 0.5,
    providerSupportsSearch: false,
    contradictions: 0,
  })

  const status = resolveStatus({ score, confidence, gateMet })

  const evidence = reverseMatches.map((match) => ({
    id: uid(),
    title: match.title,
    url: match.url,
    publisher: 'Reverse search',
    retrievedAt: new Date().toISOString(),
    quality: 'high' as const,
    stance: 'insufficient' as const,
    quote: match.snippet,
    verified: true,
  }))

  if (c2paDetected) {
    limitations.unshift('Manifest C2PA terdeteksi. Periksa provenance sebelum menyimpulkan.')
  }
  if (!input.reverseSearchKey) {
    limitations.push('Reverse search tidak dijalankan karena key tidak tersedia.')
  }

  const result: ImageResult = {
    id: uid(),
    type: 'image',
    createdAt: new Date().toISOString(),
    status,
    score,
    confidence,
    title: input.file.name,
    subtitle: `${Math.round(input.file.size / 1024)} KB`,
    summary,
    breakdown: imageScoreBreakdown(features, available),
    findings,
    recommendations,
    limitations,
    evidence,
    meta: {
      mode: input.mode,
      providerId: input.profile?.id,
      providerLabel: input.profile?.name,
      model: input.profile?.visionModel || input.profile?.model,
      promptVersion: IMAGE_PROMPT_VERSION,
      calibrationVersion: 'image-weights-2026.1',
      durationMs: Date.now() - startedAt,
      aiUsed: Boolean(input.profile),
      evidenceUsed: false,
    },
    fileName: input.file.name,
    fileSize: input.file.size,
    preview,
    exif,
    ocrText,
    aiGeneratedLikelihood,
    localOnly: true,
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
