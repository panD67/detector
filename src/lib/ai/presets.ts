import type { AiProviderKind } from '../../types/analysis'

export interface ProviderPreset {
  id: string
  label: string
  kind: AiProviderKind
  baseUrl: string
  model: string
  visionModel: string
  supportsVision: boolean
  supportsWebSearch: boolean
  notes: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    kind: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-2.5-flash',
    visionModel: 'gemini-2.5-flash',
    supportsVision: true,
    supportsWebSearch: true,
    notes: 'Paling mudah untuk grounding web.',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    kind: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    supportsVision: true,
    supportsWebSearch: false,
    notes: 'Web search membutuhkan Responses API, belum diaktifkan pada v1.',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-5-haiku-latest',
    visionModel: 'claude-3-5-haiku-latest',
    supportsVision: true,
    supportsWebSearch: false,
    notes: 'Akses browser langsung memakai header khusus Anthropic.',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    kind: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-4o-mini',
    visionModel: 'openai/gpt-4o-mini',
    supportsVision: true,
    supportsWebSearch: false,
    notes: 'Model :online bisa ditambahkan manual untuk grounding.',
  },
  {
    id: 'groq',
    label: 'Groq',
    kind: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    visionModel: '',
    supportsVision: false,
    supportsWebSearch: false,
    notes: 'Cepat, tetapi model vision tergantung ketersediaan.',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    visionModel: '',
    supportsVision: false,
    supportsWebSearch: false,
    notes: 'Tidak mendukung vision.',
  },
  {
    id: 'ollama',
    label: 'Ollama',
    kind: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.2',
    visionModel: 'llama3.2-vision',
    supportsVision: true,
    supportsWebSearch: false,
    notes: 'Berjalan lokal. Pastikan Ollama aktif.',
  },
  {
    id: 'lmstudio',
    label: 'LM Studio',
    kind: 'lmstudio',
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
    visionModel: 'local-model',
    supportsVision: true,
    supportsWebSearch: false,
    notes: 'Server lokal OpenAI-compatible.',
  },
  {
    id: 'custom',
    label: 'Custom',
    kind: 'custom',
    baseUrl: 'https://example.com/v1',
    model: 'model-name',
    visionModel: '',
    supportsVision: false,
    supportsWebSearch: false,
    notes: 'Isi base URL dan model secara manual.',
  },
]

export function getPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((preset) => preset.id === id)
}
