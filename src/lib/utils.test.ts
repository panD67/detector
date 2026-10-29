import { describe, expect, it } from 'vitest'
import {
  clamp,
  formatBytes,
  safeExternalUrl,
  titleFromUrl,
  truncate,
} from './utils'

describe('clamp', () => {
  it('membatasi nilai ke rentang 0 sampai 100', () => {
    expect(clamp(120)).toBe(100)
    expect(clamp(-4)).toBe(0)
    expect(clamp(42)).toBe(42)
  })

  it('menghormati batas kustom', () => {
    expect(clamp(5, 1, 3)).toBe(3)
  })
})

describe('truncate', () => {
  it('tidak mengubah teks pendek', () => {
    expect(truncate('teks pendek', 20)).toBe('teks pendek')
  })

  it('memotong teks panjang dan menambah elipsis', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde...')
  })
})

describe('formatBytes', () => {
  it('memformat byte, kilobyte, dan megabyte', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00 MB')
  })
})

describe('safeExternalUrl', () => {
  it('menerima http dan https', () => {
    expect(safeExternalUrl('https://example.com/a')).toBe(
      'https://example.com/a',
    )
  })

  it('menolak protokol berbahaya dan input rusak', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('bukan url')).toBeNull()
  })
})

describe('titleFromUrl', () => {
  it('mengambil hostname tanpa www', () => {
    expect(titleFromUrl('https://www.contoh.com/artikel')).toBe('contoh.com')
  })

  it('mengembalikan input jika bukan URL', () => {
    expect(titleFromUrl('bukan url')).toBe('bukan url')
  })
})
