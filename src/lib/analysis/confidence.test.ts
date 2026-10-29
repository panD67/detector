import { describe, expect, it } from 'vitest'
import { resolveConfidence } from './confidence'

describe('resolveConfidence', () => {
  it('memberi keyakinan tinggi saat tiga sinyal dan bukti eksternal cocok', () => {
    expect(
      resolveConfidence({
        independentSignals: 3,
        externalSources: 2,
        agreement: 0.8,
        providerSupportsSearch: true,
        sampleSize: 100,
      }),
    ).toBe('high')
  })

  it('membatasi keyakinan saat sampel komentar kecil', () => {
    expect(
      resolveConfidence({
        independentSignals: 4,
        externalSources: 2,
        agreement: 0.9,
        providerSupportsSearch: true,
        sampleSize: 20,
      }),
    ).toBe('medium')
  })

  it('memberi keyakinan rendah untuk sampel di bawah 10', () => {
    expect(
      resolveConfidence({
        independentSignals: 4,
        externalSources: 2,
        agreement: 0.9,
        providerSupportsSearch: true,
        sampleSize: 5,
      }),
    ).toBe('low')
  })

  it('menurunkan keyakinan jika ada kontradiksi', () => {
    expect(
      resolveConfidence({
        independentSignals: 3,
        externalSources: 2,
        agreement: 0.8,
        providerSupportsSearch: true,
        contradictions: 1,
      }),
    ).toBe('medium')
  })

  it('memberi keyakinan rendah tanpa sinyal yang cukup', () => {
    expect(
      resolveConfidence({
        independentSignals: 1,
        externalSources: 0,
        agreement: 0.2,
        providerSupportsSearch: false,
      }),
    ).toBe('low')
  })
})
