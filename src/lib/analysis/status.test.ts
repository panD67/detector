import { describe, expect, it } from 'vitest'
import { resolveStatus, riskLevelFromScore, statusMeta } from './status'

describe('riskLevelFromScore', () => {
  it('memakai ambang 30 dan 60', () => {
    expect(riskLevelFromScore(0)).toBe('low')
    expect(riskLevelFromScore(29)).toBe('low')
    expect(riskLevelFromScore(30)).toBe('medium')
    expect(riskLevelFromScore(59)).toBe('medium')
    expect(riskLevelFromScore(60)).toBe('high')
    expect(riskLevelFromScore(100)).toBe('high')
  })
})

describe('resolveStatus', () => {
  it('menghasilkan indikasi kuat hanya jika gate dan keyakinan terpenuhi', () => {
    expect(
      resolveStatus({ score: 80, confidence: 'high', gateMet: true }),
    ).toBe('strong-indication')
  })

  it('menahan skor tinggi tanpa gate menjadi perlu verifikasi', () => {
    expect(
      resolveStatus({ score: 90, confidence: 'high', gateMet: false }),
    ).toBe('needs-verification')
  })

  it('menahan skor tinggi dengan keyakinan rendah', () => {
    expect(
      resolveStatus({ score: 90, confidence: 'low', gateMet: true }),
    ).toBe('needs-verification')
  })

  it('memberi status rendah hanya jika keyakinan minimal sedang', () => {
    expect(
      resolveStatus({ score: 12, confidence: 'medium', gateMet: true }),
    ).toBe('no-strong-indication')
  })

  it('tidak menyimpulkan aman saat keyakinan rendah', () => {
    expect(
      resolveStatus({ score: 12, confidence: 'low', gateMet: false }),
    ).toBe('needs-verification')
  })

  it('mengembalikan tidak dapat diverifikasi tanpa data', () => {
    expect(
      resolveStatus({
        score: 95,
        confidence: 'high',
        gateMet: true,
        unverifiable: true,
      }),
    ).toBe('unverifiable')
  })
})

describe('statusMeta', () => {
  it('menyediakan label untuk semua status', () => {
    const labels = Object.values(statusMeta).map((item) => item.label)
    expect(labels).toContain('Tidak ada indikasi kuat')
    expect(labels).toContain('Perlu verifikasi')
    expect(labels).toContain('Indikasi kuat')
    expect(labels).toContain('Tidak dapat diverifikasi')
  })
})
