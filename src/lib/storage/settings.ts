import { z } from 'zod'

export const AI_PROFILE_SCHEMA = z.object({
  id: z.string(),
  name: z.string().min(1),
  kind: z.enum([
    'openai',
    'gemini',
    'anthropic',
    'openrouter',
    'groq',
    'deepseek',
    'ollama',
    'lmstudio',
    'custom',
  ]),
  baseUrl: z.string().url().optional().or(z.literal('')),
  model: z.string().min(1),
  visionModel: z.string().optional(),
  apiKey: z.string(),
  createdAt: z.string(),
})

export const APP_SETTINGS_SCHEMA = z.object({
  version: z.number().int().positive(),
  profiles: z.array(AI_PROFILE_SCHEMA),
  activeProfileId: z.string().nullable(),
  evidenceKeys: z.object({
    jina: z.string().optional(),
    factCheck: z.string().optional(),
    reverseSearch: z.string().optional(),
  }),
  cacheTtlMinutes: z.number().int().min(1).max(1440),
})

export type AppSettings = z.infer<typeof APP_SETTINGS_SCHEMA>

export const SETTINGS_STORAGE_KEY = 'hoaxlab:settings'
export const SETTINGS_VERSION = 1

export function defaultSettings(): AppSettings {
  return {
    version: SETTINGS_VERSION,
    profiles: [],
    activeProfileId: null,
    evidenceKeys: {},
    cacheTtlMinutes: 10,
  }
}

export function loadSettings(): { settings: AppSettings; locked: boolean } {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return { settings: defaultSettings(), locked: false }
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'encrypted' in parsed &&
      (parsed as { encrypted?: unknown }).encrypted === true
    ) {
      return { settings: defaultSettings(), locked: true }
    }
    const settings = APP_SETTINGS_SCHEMA.parse(parsed)
    return { settings, locked: false }
  } catch {
    return { settings: defaultSettings(), locked: false }
  }
}

export function saveSettings(settings: AppSettings): void {
  const validated = APP_SETTINGS_SCHEMA.parse(settings)
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(validated))
}

export function clearAllSettings(): void {
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
}
