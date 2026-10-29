import type { AiAdapter } from './types'
import type { AiProfile } from '../../types/analysis'
import { AnthropicAdapter } from './adapters/anthropic'
import { GeminiAdapter } from './adapters/gemini'
import { OpenAiCompatibleAdapter } from './adapters/openai-compatible'

export function createAdapter(profile: AiProfile): AiAdapter {
  if (profile.kind === 'gemini') return new GeminiAdapter(profile)
  if (profile.kind === 'anthropic') return new AnthropicAdapter(profile)
  return new OpenAiCompatibleAdapter(profile)
}
