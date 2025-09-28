import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import ToastProvider, { useToast, TOAST_TTL_MS, TOAST_MAX } from '../../components/ui/Toast'
import { resetUsersStore } from '../useUsersStore'


function TestApp() {
  const { show } = useToast()
  return (
    <div>
      <button onClick={() => show('one')}>One</button>
      <button onClick={() => show('two')}>Two</button>
      <button onClick={() => show('three')}>Three</button>
      <button onClick={() => show('four')}>Four</button>
    </div>
  )
}

describe('ToastProvider - queue behavior', () => {
  beforeEach(() => {
    resetUsersStore()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('enforces TOAST_MAX and shows the newest toasts', () => {
    render(
      <ToastProvider>
        <TestApp />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('One'))
    fireEvent.click(screen.getByText('Two'))
    fireEvent.click(screen.getByText('Three'))
    fireEvent.click(screen.getByText('Four'))

    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBe(TOAST_MAX)
  })

  it('auto-removes toasts after TTL', () => {
    render(
      <ToastProvider>
        <TestApp />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('One'))
    expect(screen.getAllByRole('status').length).toBe(1)

    act(() => {
      vi.advanceTimersByTime(TOAST_TTL_MS + 100)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
