import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useUsersStore, resetUsersStore, TOAST_TTL_MS, TOAST_MAX, showToast } from '@/stores/useUsersStore'

describe('useUsersStore toast queue', () => {
  beforeEach(() => {
    resetUsersStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('enforces max queue length and drops oldest toasts', () => {
    // push more than TOAST_MAX toasts
    for (let i = 0; i < TOAST_MAX + 2; i++) {
      showToast(`m${i}`)
    }

    const q = useUsersStore.getState().toastQueue
    expect(q.length).toBe(TOAST_MAX)
    // newest messages should be at the front
    expect(q[0].message).toBe(`m${TOAST_MAX + 1}`)
  })

  it('auto-removes toasts after TTL', () => {
    showToast('hello')
    let q = useUsersStore.getState().toastQueue
    expect(q.length).toBe(1)

    // advance less than TTL - should still be present
    vi.advanceTimersByTime(TOAST_TTL_MS - 100)
    q = useUsersStore.getState().toastQueue
    expect(q.length).toBe(1)

    // advance to after TTL
    vi.advanceTimersByTime(200)
    q = useUsersStore.getState().toastQueue
    expect(q.length).toBe(0)
  })
})
