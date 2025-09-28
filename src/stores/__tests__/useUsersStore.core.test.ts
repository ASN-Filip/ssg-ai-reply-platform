import { act } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'

import { useUsersStore, resetUsersStore, TOAST_TTL_MS } from '../useUsersStore'

describe('useUsersStore - core actions', () => {
  beforeEach(() => {
    // reset Zustand store to known fixture state before each test
    resetUsersStore()
    vi.useFakeTimers()
  })

  it('openEdit sets editingUser for an existing user', () => {
    const initial = useUsersStore.getState()
    const firstUser = initial.users[0]
    expect(firstUser).toBeDefined()

    act(() => {
      initial.openEdit({ id: firstUser.id, name: firstUser.name, email: firstUser.email, role: firstUser.role })
    })

    const state = useUsersStore.getState()
    expect(state.editingUser).toEqual({
      id: firstUser.id,
      name: firstUser.name,
      email: firstUser.email,
      role: firstUser.role,
    })
  })

  it('createUser adds a new user and shows a toast', () => {
    const state = useUsersStore.getState()
    const beforeCount = state.users.length

    act(() => {
      state.createUser({ name: 'New One', email: 'new@example.com', role: 'user' })
    })

    const after = useUsersStore.getState()
    expect(after.users.length).toBe(beforeCount + 1)
    const created = after.users.find((u) => u.email === 'new@example.com')
    expect(created).toBeDefined()

    // toast should be queued
    expect(after.toastQueue.length).toBeGreaterThan(0)

    // advance timers to allow toast TTL to expire and be removed
    act(() => {
      vi.advanceTimersByTime(TOAST_TTL_MS + 10)
    })

    const later = useUsersStore.getState()
    expect(later.toastQueue.length).toBe(0)
  })

  it('updateUser modifies an existing user and shows a toast', () => {
    const state = useUsersStore.getState()
    const target = state.users[0]
    const newName = target.name + ' Updated'

    act(() => {
      state.updateUser({ id: target.id, name: newName, email: target.email, role: target.role })
    })

    const after = useUsersStore.getState()
    const updated = after.users.find((u) => u.id === target.id)
    expect(updated).toBeDefined()
    expect(updated?.name).toBe(newName)

    // toast should be queued
    expect(after.toastQueue.length).toBeGreaterThan(0)

    // ensure toast is auto-removed
    act(() => {
      vi.advanceTimersByTime(TOAST_TTL_MS + 5)
    })

    const later = useUsersStore.getState()
    expect(later.toastQueue.length).toBe(0)
  })
})
