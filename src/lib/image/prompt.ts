import { z } from 'zod'

export const IMAGE_PROMPT_VERSION = 'image-v1'

export const ImageAiSchema = z.object({
  aiAssessment: z.number().min(0).max(1),
  aiGeneratedLikelihood: z.number().min(0).max(1).nullable(),
  summary: z.string().min(10),
  findings: z.array(
    z.object({
      title: z.string().min(3),
      detail: z.string().min(3),
      severity: z.enum(['low', 'medium', 'high']),
    }),
  ),
  recommendations: z.array(z.string().min(3)).min(1),
  limitations: z.array(z.string().min(3)).min(1),
  ocrConsistency: z.number().min(0).max(1),
  visualArtifactRisk: z.number().min(0).max(1),
})

export type ImageAiOutput = z.infer<typeof ImageAiSchema>

export function buildImagePrompt(input: {
  context?: string
  ocrText: string
  exif: Record<string, string>
  mode: 'fast' | 'balanced' | 'deep'
}): { system: string; user: string } {
  const system = [
    'Kamu adalah analis risiko konteks foto, bukan detektor pasti.',
    'Kembalikan hanya JSON valid.',
    'Jangan menyatakan pasti AI atau manipulasi.',
    'Bedakan foto asli dengan konteks salah dari foto sintetis.',
  ].join(' ')

  const user = [
    `Mode: ${input.mode}`,
    input.context ? `Konteks pengguna: ${input.context}` : '',
    'Metadata EXIF:',
    JSON.stringify(input.exif, null, 2),
    'Teks OCR:',
    input.ocrText || '(tidak ada)',
    '',
    'Kembalikan JSON dengan field: aiAssessment, aiGeneratedLikelihood, summary, findings, recommendations, limitations, ocrConsistency, visualArtifactRisk.',
  ]
    .filter(Boolean)
    .join('\n')

  return { system, user }
}
