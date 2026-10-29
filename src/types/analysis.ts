export type AnalysisType = 'link' | 'comment' | 'image'

export type AnalysisMode = 'fast' | 'balanced' | 'deep'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export type AnalysisStatus =
  | 'no-strong-indication'
  | 'needs-verification'
  | 'strong-indication'
  | 'unverifiable'

export type RiskLevel = 'low' | 'medium' | 'high'

export type FindingSeverity = RiskLevel

export type EvidenceStance =
  | 'supports'
  | 'refutes'
  | 'insufficient'
  | 'irrelevant'

export type SourceQuality = 'high' | 'medium' | 'low'

export type ClaimAssessment =
  | 'supported'
  | 'refuted'
  | 'mixed'
  | 'insufficient'

export type AiProviderKind =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'openrouter'
  | 'groq'
  | 'deepseek'
  | 'ollama'
  | 'lmstudio'
  | 'custom'

export interface EvidenceSource {
  id: string
  title: string
  url?: string
  publisher?: string
  publishedAt?: string
  retrievedAt: string
  quality: SourceQuality
  stance: EvidenceStance
  quote?: string
  verified?: boolean
}

export interface Claim {
  id: string
  text: string
  assessment: ClaimAssessment
  explanation: string
  evidenceIds: string[]
}

export interface Finding {
  id: string
  title: string
  detail: string
  severity: FindingSeverity
}

export interface ScoreComponent {
  key: string
  label: string
  score: number
  weight: number
  detail: string
  available: boolean
}

export interface AnalysisMeta {
  mode: AnalysisMode
  providerId?: string
  providerLabel?: string
  model?: string
  promptVersion?: string
  calibrationVersion?: string
  durationMs?: number
  aiUsed: boolean
  evidenceUsed: boolean
}

export interface AnalysisResultBase {
  id: string
  type: AnalysisType
  createdAt: string
  status: AnalysisStatus
  score: number
  confidence: ConfidenceLevel
  title: string
  subtitle?: string
  summary: string
  breakdown: ScoreComponent[]
  findings: Finding[]
  recommendations: string[]
  limitations: string[]
  evidence: EvidenceSource[]
  meta: AnalysisMeta
}

export interface LinkResult extends AnalysisResultBase {
  type: 'link'
  url: string
  domain: string
  excerpt: string
  wordCount: number
  claims: Claim[]
}

export interface CommentResult extends AnalysisResultBase {
  type: 'comment'
  totalComments: number
  uniqueComments: number
  duplicatePercent: number
  spamPercent: number
  duplicateSamples: string[][]
}

export interface ImageResult extends AnalysisResultBase {
  type: 'image'
  fileName: string
  fileSize: number
  preview: string
  exif: Record<string, string>
  ocrText: string
  aiGeneratedLikelihood: number | null
  localOnly: boolean
}

export type AnalysisResult = LinkResult | CommentResult | ImageResult

export interface AiProfile {
  id: string
  name: string
  kind: AiProviderKind
  baseUrl?: string
  model: string
  visionModel?: string
  apiKey: string
  createdAt: string
}
