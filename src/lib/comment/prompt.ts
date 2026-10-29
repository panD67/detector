import { z } from 'zod'

export const COMMENT_PROMPT_VERSION = 'comment-v1'

export const CommentAiSchema = z.object({
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

export type CommentAiOutput = z.infer<typeof CommentAiSchema>

export function buildCommentPrompt(input: {
  stats: Record<string, unknown>
  samples: string[]
  mode: 'fast' | 'balanced' | 'deep'
}): { system: string; user: string } {
  const system = [
    'Kamu adalah analis pola komentar agregat.',
    'Jangan menuduh akun individu. Fokus pada pola.',
    'Kembalikan hanya JSON valid.',
  ].join(' ')

  const user = [
    `Mode: ${input.mode}`,
    'Statistik:',
    JSON.stringify(input.stats, null, 2),
    'Contoh komentar:',
    ...input.samples.slice(0, 20).map((sample, index) => `${index + 1}. ${sample}`),
    '',
    'Kembalikan JSON dengan field: aiAssessment, summary, findings, recommendations, limitations.',
  ].join('\n')

  return { system, user }
}
