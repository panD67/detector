import type { AiAdapter, AiRequest, AiResponse } from '../types'
import type { AiProviderKind } from '../types'
import { AiError, mapHttpError, toAiError } from '../errors'
import type { AiProfile } from '../../../types/analysis'

export class GeminiAdapter implements AiAdapter {
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
    this.kind = 'gemini'
    this.supportsVision = true
    this.supportsWebSearch = true
  }

  async analyze(request: AiRequest): Promise<AiResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      request.timeoutMs ?? 120_000,
    )

    try {
      const model = request.images?.length ? this.profile.visionModel || this.profile.model : this.profile.model
      const baseUrl = this.profile.baseUrl?.replace(/\/$/, '') || 'https://generativelanguage.googleapis.com'
      const url = `${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.profile.apiKey)}`

      const parts: Array<Record<string, unknown>> = [{ text: request.user }]
      for (const image of request.images ?? []) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        })
      }

      const body: Record<string, unknown> = {
        systemInstruction: {
          parts: [{ text: request.system }],
        },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: request.jsonMode ? 'application/json' : 'text/plain',
        },
      }

      if (request.webSearch) {
        body.tools = [{ googleSearch: {} }]
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw mapHttpError(response.status, this.label)
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> }
          groundingMetadata?: {
            groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>
          }
        }>
      }
      const candidate = data.candidates?.[0]
      const text = candidate?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n')
      if (!text || text.trim().length === 0) {
        throw new AiError('invalid', `${this.label} tidak mengembalikan teks.`)
      }

      const sources = candidate?.groundingMetadata?.groundingChunks
        ?.map((chunk) => ({
          title: chunk.web?.title || 'Sumber web',
          url: chunk.web?.uri || '',
        }))
        .filter((source) => source.url)

      return { text, sources }
    } catch (error) {
      throw toAiError(error, this.label)
    } finally {
      clearTimeout(timeout)
    }
  }
}
