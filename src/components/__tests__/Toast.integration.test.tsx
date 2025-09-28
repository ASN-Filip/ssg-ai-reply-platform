import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { resetUsersStore, TOAST_TTL_MS, TOAST_MAX } from '@/stores/useUsersStore'

function TestApp() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('one')}>One</button>
      <button onClick={() => showToast('two')}>Two</button>
      <button onClick={() => showToast('three')}>Three</button>
      <button onClick={() => showToast('four')}>Four</button>
      <Toast />
    </div>
  )
}

describe('Toast UI integration', () => {
  beforeEach(() => {
    resetUsersStore()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders stacked toasts and respects TOAST_MAX', () => {
    render(<TestApp />)
    fireEvent.click(screen.getByText('One'))
    fireEvent.click(screen.getByText('Two'))
    fireEvent.click(screen.getByText('Three'))
    fireEvent.click(screen.getByText('Four'))

    // Only TOAST_MAX items should be visible
    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBe(TOAST_MAX)
  })

  it('auto-removes toasts after TTL', () => {
    render(<TestApp />)
    fireEvent.click(screen.getByText('One'))
    expect(screen.getAllByRole('status').length).toBe(1)

    act(() => {
      vi.advanceTimersByTime(TOAST_TTL_MS + 100)
    })
    // after TTL it should be removed
    expect(screen.queryByRole('status')).toBeNull()
  })
})
