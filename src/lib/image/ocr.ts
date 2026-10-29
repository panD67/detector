export async function runOcr(
  file: File,
  onProgress?: (value: number) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(['eng', 'ind'], 1, {
    logger: (message) => {
      if (typeof message.progress === 'number') {
        onProgress?.(Math.round(message.progress * 100))
      }
    },
  })
  try {
    const { data } = await worker.recognize(file)
    return data.text.trim()
  } finally {
    await worker.terminate()
  }
}
