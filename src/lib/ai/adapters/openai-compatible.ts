import type { AiAdapter, AiRequest, AiResponse } from '../types'
import type { AiProviderKind } from '../types'
import { AiError, mapHttpError, toAiError } from '../errors'
import type { AiProfile } from '../../../types/analysis'

export class OpenAiCompatibleAdapter implements AiAdapter {
  id: string
  label: string
  kind: AiProviderKind
  supportsVision: boolean
  supportsWebSearch: boolean

  private profile: AiProfile

  constructor(profile: AiProfile) {
    this.profile = profile
    this.id = profile.id
    this.label = profile.name
    this.kind = profile.kind
    this.supportsVision = Boolean(profile.visionModel)
    this.supportsWebSearch = false
  }

  async analyze(request: AiRequest): Promise<AiResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      request.timeoutMs ?? 120_000,
    )

    try {
      const baseUrl = this.profile.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1'
      const content =
        request.images && request.images.length > 0
          ? [
              { type: 'text', text: request.user },
              ...request.images.map((image: { mimeType: string; data: string }) => ({
                type: 'image_url',
                image_url: {
                  url: `data:${image.mimeType};base64,${image.data}`,
                },
              })),
            ]
          : request.user

      const body: Record<string, unknown> = {
        model: this.profile.model,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content },
        ],
        temperature: 0.2,
      }

      if (request.jsonMode) {
        body.response_format = { type: 'json_object' }
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.profile.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw mapHttpError(response.status, this.label)
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
        usage?: { prompt_tokens?: number; completion_tokens?: number }
      }
      const text = data.choices?.[0]?.message?.content
      if (typeof text !== 'string' || text.trim().length === 0) {
        throw new AiError('invalid', `${this.label} tidak mengembalikan teks.`)
      }

      return {
        text,
        usage: {
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens,
        },
      }
    } catch (error) {
      throw toAiError(error, this.label)
    } finally {
      clearTimeout(timeout)
    }
  }
}
