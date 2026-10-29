import exifr from 'exifr'

export async function readExif(file: File): Promise<Record<string, string>> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      icc: false,
      iptc: true,
      xmp: true,
    })
    if (!data || typeof data !== 'object') return {}
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue
      if (typeof value === 'object') {
        try {
          result[key] = JSON.stringify(value)
        } catch {
          result[key] = String(value)
        }
      } else {
        result[key] = String(value)
      }
    }
    return result
  } catch {
    return {}
  }
}
