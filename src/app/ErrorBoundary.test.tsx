import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenView(): never {
  throw new Error('Kesalahan uji.')
}

describe('ErrorBoundary', () => {
  it('menampilkan fallback yang bisa dipulihkan', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    )

    expect(
      screen.getByRole('heading', { name: 'Aplikasi berhenti karena error' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Muat ulang' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Kembali ke beranda' }),
    ).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
