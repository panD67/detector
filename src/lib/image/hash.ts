export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gambar tidak bisa dibaca.'))
    }
    image.src = url
  })
}

function canvasContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas tidak tersedia.')
  return context
}

export async function createThumbnail(file: File, max = 400): Promise<string> {
  const image = await loadImage(file)
  const scale = Math.min(1, max / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const context = canvasContext(width, height)
  context.drawImage(image, 0, 0, width, height)
  return context.canvas.toDataURL('image/jpeg', 0.82)
}

export async function averageHash(file: File): Promise<string> {
  const image = await loadImage(file)
  const context = canvasContext(8, 8)
  context.drawImage(image, 0, 0, 8, 8)
  const data = context.getImageData(0, 0, 8, 8).data
  const grays = Array.from({ length: 64 }, (_, index) => {
    const offset = index * 4
    return (data[offset] + data[offset + 1] + data[offset + 2]) / 3
  })
  const mean = grays.reduce((sum, value) => sum + value, 0) / grays.length
  return grays.map((value) => (value >= mean ? '1' : '0')).join('')
}

export async function differenceHash(file: File): Promise<string> {
  const image = await loadImage(file)
  const context = canvasContext(9, 8)
  context.drawImage(image, 0, 0, 9, 8)
  const data = context.getImageData(0, 0, 9, 8).data
  let result = ''
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const left = (y * 9 + x) * 4
      const right = (y * 9 + x + 1) * 4
      const leftGray = (data[left] + data[left + 1] + data[left + 2]) / 3
      const rightGray = (data[right] + data[right + 1] + data[right + 2]) / 3
      result += leftGray > rightGray ? '1' : '0'
    }
  }
  return result
}

export function hammingDistance(left: string, right: string): number {
  if (left.length !== right.length) return left.length
  let distance = 0
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) distance += 1
  }
  return distance
}
