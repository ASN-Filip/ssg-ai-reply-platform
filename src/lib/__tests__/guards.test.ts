import { vi, describe, it, expect, afterEach } from 'vitest'

// mock getServerAuthSession from src/lib/auth
vi.mock('../auth', () => ({
  getServerAuthSession: vi.fn(),
}))

import { getServerAuthSession } from '../auth'
import type { Session } from 'next-auth'
const mockedGetServerAuthSession = vi.mocked(getServerAuthSession)
import { isAuthenticated, isAdmin } from '../guards.server'

describe('guards', () => {
  afterEach(() => vi.resetAllMocks())

  it('isAuthenticated returns true when session exists', async () => {
  const s: Session = { expires: '', user: { id: '1', email: 'a@b.com' } }
    mockedGetServerAuthSession.mockResolvedValue(s)
    expect(await isAuthenticated()).toBe(true)
  })

  it('isAuthenticated returns false when no session', async () => {
    mockedGetServerAuthSession.mockResolvedValue(null as Session | null)
    expect(await isAuthenticated()).toBe(false)
  })

  it('isAdmin returns true for admin role', async () => {
  const s2: Session = { expires: '', user: { id: '2', name: 'F', email: 'f@e', role: 'admin' } }
    mockedGetServerAuthSession.mockResolvedValue(s2)
    expect(await isAdmin()).toBe(true)
  })

  it('isAdmin returns false for non-admin', async () => {
  const s3: Session = { expires: '', user: { id: '3', name: 'U', email: 'u@e', role: 'user' } }
    mockedGetServerAuthSession.mockResolvedValue(s3)
    expect(await isAdmin()).toBe(false)
  })
})
