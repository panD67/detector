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

export interface AiImageInput {
  mimeType: string
  data: string
}

export interface AiRequest {
  system: string
  user: string
  images?: AiImageInput[]
  webSearch?: boolean
  jsonMode?: boolean
  timeoutMs?: number
}

export interface AiResponse {
  text: string
  sources?: Array<{
    title: string
    url: string
    snippet?: string
  }>
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

export interface AiAdapter {
  id: string
  label: string
  kind: AiProviderKind
  supportsVision: boolean
  supportsWebSearch: boolean
  analyze(request: AiRequest): Promise<AiResponse>
}
