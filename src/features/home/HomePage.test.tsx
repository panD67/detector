import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('menampilkan nilai utama dan status build yang jujur', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Nilai risiko hoaks dengan bukti, bukan tebakan/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Fase 1 selesai: fondasi siap')).toBeInTheDocument()
    expect(screen.getByText('2 / 13 fase')).toBeInTheDocument()
  })
})
