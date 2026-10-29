export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit,
  options: { retries?: number; timeoutMs?: number } = {},
): Promise<Response> {
  const retries = options.retries ?? 3
  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 120_000)
    const signal = init.signal
    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    try {
      const response = await fetch(input, { ...init, signal: controller.signal })
      clearTimeout(timeout)

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
          continue
        }
      }
      return response
    } catch (error) {
      clearTimeout(timeout)
      lastError = error
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
        continue
      }
      throw error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Permintaan gagal.')
}
