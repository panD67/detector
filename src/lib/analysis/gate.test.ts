import { describe, expect, it } from 'vitest'
import { isEvidenceGateMet, scoreCapForGate } from './gate'

describe('isEvidenceGateMet', () => {
  it('link lolos dengan dua sinyal independen', () => {
    expect(
      isEvidenceGateMet({
        type: 'link',
        independentSignals: 2,
        externalSources: 0,
      }),
    ).toBe(true)
  })

  it('link gagal dengan satu sinyal', () => {
    expect(
      isEvidenceGateMet({
        type: 'link',
        independentSignals: 1,
        externalSources: 0,
      }),
    ).toBe(false)
  })

  it('komentar butuh sampel 30 dan tiga sinyal', () => {
    expect(
      isEvidenceGateMet({
        type: 'comment',
        independentSignals: 3,
        externalSources: 0,
        sampleSize: 30,
      }),
    ).toBe(true)

    expect(
      isEvidenceGateMet({
        type: 'comment',
        independentSignals: 3,
        externalSources: 0,
        sampleSize: 29,
      }),
    ).toBe(false)
  })

  it('foto lolos dengan detector khusus di atas 0.90', () => {
    expect(
      isEvidenceGateMet({
        type: 'image',
        independentSignals: 0,
        externalSources: 0,
        detectorConfidence: 0.91,
      }),
    ).toBe(true)
  })

  it('foto gagal dengan detector di bawah 0.90', () => {
    expect(
      isEvidenceGateMet({
        type: 'image',
        independentSignals: 1,
        externalSources: 0,
        detectorConfidence: 0.89,
      }),
    ).toBe(false)
  })
})

describe('scoreCapForGate', () => {
  it('membatasi skor sesuai tipe saat gate gagal', () => {
    expect(scoreCapForGate('link', false)).toBe(60)
    expect(scoreCapForGate('comment', false)).toBe(65)
    expect(scoreCapForGate('image', false)).toBe(65)
    expect(scoreCapForGate('link', true)).toBeNull()
  })
})
