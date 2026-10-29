export type AiErrorCode =
  | 'auth'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'timeout'
  | 'network'
  | 'invalid'
  | 'unsupported'

export class AiError extends Error {
  code: AiErrorCode
  status?: number

  constructor(code: AiErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'AiError'
    this.code = code
    this.status = status
  }
}

export function mapHttpError(status: number, providerLabel: string): AiError {
  if (status === 401 || status === 403) {
    return new AiError(
      'auth',
      `${providerLabel} menolak API key atau akses. Periksa key dan izin model.`,
      status,
    )
  }
  if (status === 404) {
    return new AiError(
      'not_found',
      `${providerLabel} tidak menemukan model atau endpoint. Periksa nama model dan base URL.`,
      status,
    )
  }
  if (status === 429) {
    return new AiError(
      'rate_limit',
      `${providerLabel} mencapai batas kuota atau permintaan. Coba lagi nanti atau ganti provider.`,
      status,
    )
  }
  if (status >= 500) {
    return new AiError(
      'server',
      `${providerLabel} sedang bermasalah di sisi server. Coba lagi nanti.`,
      status,
    )
  }
  return new AiError(
    'invalid',
    `${providerLabel} mengembalikan respons tidak valid (${status}).`,
    status,
  )
}

export function toAiError(error: unknown, providerLabel: string): AiError {
  if (error instanceof AiError) return error
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AiError('timeout', `${providerLabel} melebihi batas waktu.`)
  }
  if (error instanceof TypeError) {
    return new AiError(
      'network',
      `${providerLabel} tidak bisa dijangkau. Periksa koneksi, base URL, atau pembatasan CORS.`,
    )
  }
  if (error instanceof Error) {
    return new AiError('network', `${providerLabel}: ${error.message}`)
  }
  return new AiError('network', `${providerLabel} gagal dihubungi.`)
}
