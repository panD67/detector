import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './Toast'

function ToastTrigger() {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: 'Tersimpan',
          description: 'Pengaturan lokal berhasil diperbarui.',
          variant: 'success',
        })
      }
    >
      Munculkan toast
    </button>
  )
}

describe('ToastProvider', () => {
  it('menampilkan dan menutup notifikasi', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Munculkan toast' }))
    expect(screen.getByText('Tersimpan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tutup notifikasi' }))
    expect(screen.queryByText('Tersimpan')).not.toBeInTheDocument()
  })

  it('melempar error jika dipakai di luar provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => render(<ToastTrigger />)).toThrow(
      'useToast harus dipakai di dalam ToastProvider.',
    )

    consoleError.mockRestore()
  })
})
