import type { AiAdapter, AiRequest, AiResponse } from '../types'
import type { AiProviderKind } from '../types'
import { AiError, mapHttpError, toAiError } from '../errors'
import { fetchWithRetry } from '../http'
import type { AiProfile } from '../../../types/analysis'

export class AnthropicAdapter implements AiAdapter {
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
    this.kind = 'anthropic'
    this.supportsVision = true
    this.supportsWebSearch = true
  }

  async analyze(request: AiRequest): Promise<AiResponse> {
    try {
      const baseUrl = this.profile.baseUrl?.replace(/\/$/, '') || 'https://api.anthropic.com'
      const model = request.images?.length ? this.profile.visionModel || this.profile.model : this.profile.model

      const content: Array<Record<string, unknown>> = [{ type: 'text', text: request.user }]
      for (const image of request.images ?? []) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.mimeType,
            data: image.data,
          },
        })
      }

      const body: Record<string, unknown> = {
        model,
        max_tokens: 4096,
        system: request.system,
        messages: [{ role: 'user', content }],
        temperature: 0.2,
      }

      if (request.webSearch) {
        body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]
      }

      const response = await fetchWithRetry(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.profile.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      }, { timeoutMs: request.timeoutMs ?? 120_000 })

      if (!response.ok) {
        throw mapHttpError(response.status, this.label)
      }

      const data = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>
      }
      const text = data.content
        ?.filter((block) => block.type === 'text')
        .map((block) => block.text)
        .filter(Boolean)
        .join('\n')

      if (!text || text.trim().length === 0) {
        throw new AiError('invalid', `${this.label} tidak mengembalikan teks.`)
      }

      return { text }
    } catch (error) {
      throw toAiError(error, this.label)
    }
  }
}
