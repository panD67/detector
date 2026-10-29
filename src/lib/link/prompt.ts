import { z } from 'zod'

export const LINK_PROMPT_VERSION = 'link-v1'

export const LinkAiSchema = z.object({
  pageType: z.enum(['news', 'fact-check', 'opinion', 'satire', 'promotion', 'forum', 'unknown']),
  claims: z
    .array(
      z.object({
        text: z.string().min(3),
        assessment: z.enum(['supported', 'refuted', 'mixed', 'insufficient']),
        explanation: z.string().min(3),
        evidenceNeeded: z.string().min(3),
      }),
    )
    .max(8),
  clickbait: z.number().min(0).max(1),
  attribution: z.number().min(0).max(1),
  emotion: z.number().min(0).max(1),
  titleBodyConsistency: z.number().min(0).max(1),
  aiAssessment: z.number().min(0).max(1),
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
})

export type LinkAiOutput = z.infer<typeof LinkAiSchema>

export function buildLinkPrompt(input: {
  url: string
  title: string
  text: string
  context?: string
  mode: 'fast' | 'balanced' | 'deep'
}): { system: string; user: string } {
  const system = [
    'Kamu adalah pengekstrak fitur risiko hoaks, bukan juri.',
    'Kembalikan hanya JSON valid sesuai skema.',
    'Jangan menyimpulkan hoaks atau aman secara absolut.',
    'Setiap klaim harus dapat diperiksa. Jika tidak ada sumber, tulis "tidak ditemukan".',
    'Jangan mengarang URL.',
  ].join(' ')

  const user = [
    `URL: ${input.url}`,
    `Judul: ${input.title}`,
    `Mode: ${input.mode}`,
    input.context ? `Konteks pengguna: ${input.context}` : '',
    'Teks artikel:',
    input.text.slice(0, 12000),
    '',
    'Kembalikan JSON dengan field: pageType, claims, clickbait, attribution, emotion, titleBodyConsistency, aiAssessment, summary, findings, recommendations, limitations.',
  ]
    .filter(Boolean)
    .join('\n')

  return { system, user }
}
