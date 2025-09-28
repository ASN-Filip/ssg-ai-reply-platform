import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock next-auth to avoid provider network fetches during unit tests.
vi.mock('next-auth/react', () => {
  const React = require('react')
  return {
    useSession: () => ({ data: { user: { name: 'Test User', email: 'test@example.com', role: 'admin' } }, status: 'authenticated' }),
    signIn: () => Promise.resolve(null),
    signOut: () => Promise.resolve(null),
    SessionProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  }
})

// stub fetch so HeaderClient's site-map and profile requests succeed
beforeEach(() => {
  globalThis.fetch = vi.fn((input) => {
    const url = String(input)
    if (url.includes('/api/site-map')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/api/users/me')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { id: 'u1', name: 'Test User', role: 'admin' } }) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }) as any
})
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'
import ClientProviders from '@/components/ClientProviders'

describe('Header mobile menu', () => {
  test('opens menu, sets aria-expanded, traps focus, and closes on outside click and Escape', async () => {
    render(
      <ClientProviders>
        <Header />
      </ClientProviders>
    )
    const user = userEvent.setup()

    const toggle = screen.getByRole('button', { name: /open menu|close menu/i })

    // Initially closed
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Open the menu
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

  // The mobile menu should now be visible (has id mobile-menu)
  const lists = screen.getAllByRole('list')
  const menu = lists.find((l) => l.id === 'mobile-menu') || document.getElementById('mobile-menu')
  expect(menu).toBeInTheDocument()

    // Focus should be inside the menu - first focusable element should have focus
    const firstFocusable = menu?.querySelector('a, button, [tabindex]:not([tabindex="-1"])') as HTMLElement | null
    if (firstFocusable) {
      expect(document.activeElement).toBe(firstFocusable)
    }

    // Press Tab to cycle focus - we simulate a Tab press
    await user.tab()
    // After tabbing, ensure focus remains within the menu
    expect(menu?.contains(document.activeElement)).toBe(true)

    // Close with outside click
    await user.click(document.body)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Re-open and close with Escape
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
