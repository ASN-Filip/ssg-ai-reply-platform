import React from 'react'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import UsersClient from '@/components/UsersClient'
import { ToastProvider } from '@/components/ui/Toast'
import { users as initialUsers } from '@/data/users'
import { resetUsersStore } from '@/stores/useUsersStore'

// vitest globals (describe, test, expect, vi) are available at runtime via vitest.
// Importing types is not necessary for the tests to run, but editors/TS may require
// the `types` config in tsconfig or vitest config. The test runner provides the globals.

describe('UsersClient', () => {
  beforeEach(() => {
    // reset store state to initial fixture before every test
    resetUsersStore()
  })
  test('renders initial users and filters by search query', () => {
    render(
      <ToastProvider>
        <UsersClient />
      </ToastProvider>
    )

    // Ensure at least one of the known mock users appears
    expect(screen.getByText(initialUsers[0].name)).toBeInTheDocument()

    // Type a query that matches a user's email
    const input = screen.getByPlaceholderText(/Search users by name or email/i)
    fireEvent.change(input, { target: { value: initialUsers[1].email.split('@')[0] } })

    // Only matching user(s) should be visible
    expect(screen.getByText(initialUsers[1].name)).toBeInTheDocument()
    // A different user should not be visible (assuming different name)
    if (initialUsers[0].name !== initialUsers[1].name) {
      expect(screen.queryByText(initialUsers[0].name)).not.toBeInTheDocument()
    }
  })

  test('filters by role and allows deleting a user', () => {
    render(
      <ToastProvider>
        <UsersClient />
      </ToastProvider>
    )

    // Choose a role that we know exists in the fixture
    const roleToFilter = initialUsers.find(u => u.role === 'admin')?.role || 'admin'
    const roleSelect = screen.getByLabelText(/Filter by role/i)
    fireEvent.change(roleSelect, { target: { value: roleToFilter } })

    // After filtering, at least one admin should be present
    const adminUser = initialUsers.find(u => u.role === roleToFilter)
    if (!adminUser) throw new Error('Test fixture missing an admin user')
    expect(screen.getByText(adminUser.name)).toBeInTheDocument()

  // Click the delete button for the visible user
  const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
  fireEvent.click(deleteButtons[0])

  // A confirmation dialog should appear
  const dialog = screen.getByRole('dialog', { name: /confirm delete/i })
  expect(dialog).toBeInTheDocument()

  // Click the Delete inside the dialog
  const dialogDelete = within(dialog).getByRole('button', { name: /delete/i })
  fireEvent.click(dialogDelete)

  // After deletion the user's name should no longer be in the document
  expect(screen.queryByText(adminUser.name)).not.toBeInTheDocument()

  // A toast should be visible indicating deletion
  expect(screen.getByRole('status')).toHaveTextContent(/user deleted/i)
  })

  test('creates a new user via the create user form (mock)', () => {
    render(
      <ToastProvider>
        <UsersClient />
      </ToastProvider>
    )

  // Open create user form
  const createButton = screen.getByRole('button', { name: /add new user/i })
    fireEvent.click(createButton)

    // Fill out the form inside the dialog
    const dialog = screen.getByRole('dialog', { name: /create user/i })
    const nameInput = within(dialog).getByPlaceholderText('Name')
    const emailInput = within(dialog).getByPlaceholderText('Email')
    const roleSelect = within(dialog).getByLabelText(/User role/i)

    fireEvent.change(nameInput, { target: { value: 'Test New' } })
    fireEvent.change(emailInput, { target: { value: 'test.new@example.com' } })
    fireEvent.change(roleSelect, { target: { value: 'user' } })

    // Submit within the dialog
    const submit = within(dialog).getByRole('button', { name: /save/i })
    fireEvent.click(submit)

    // New user should appear in the list
    expect(screen.getByText('Test New')).toBeInTheDocument()

    // Toast confirming creation (optional) - the component uses a toast for actions
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
  })

  test('reset password triggers a toast message', () => {
    render(
      <ToastProvider>
        <UsersClient />
      </ToastProvider>
    )

    // Click the reset password button for the first visible user
    const resetButtons = screen.getAllByRole('button', { name: /reset password/i })
    fireEvent.click(resetButtons[0])

    // Expect a toast/status message mentioning password reset
    expect(screen.getByRole('status')).toHaveTextContent(/password reset link sent for user/i)
  })

  test('changing a user role updates the displayed role', () => {
    render(
      <ToastProvider>
        <UsersClient />
      </ToastProvider>
    )

    // Find the first user's role block and the select to change role
    const userArticle = screen.getAllByRole('article')[0]
    // Role text is shown in a div with text 'Role: <role>' — find that element
    const roleDiv = within(userArticle).getByText(/Role:/i)
    expect(roleDiv).toBeInTheDocument()

    const roleSelect = within(userArticle).getByRole('combobox')
    // Change to 'admin'
    fireEvent.change(roleSelect, { target: { value: 'admin' } })

    // The role text should now contain 'admin'
    expect(within(userArticle).getByText(/Role:\s*admin/i)).toBeInTheDocument()
  })
})
