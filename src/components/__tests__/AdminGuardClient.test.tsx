import React from 'react'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminGuardClient from '../AdminGuardClient'

describe('AdminGuardClient', () => {
  beforeEach(() => {
    window.localStorage.removeItem('mockRole')
  })

  test('shows children when mockRole=admin', async () => {
    window.localStorage.setItem('mockRole', 'admin')
    render(
      <AdminGuardClient>
        <div>Secret</div>
      </AdminGuardClient>
    )

    expect(await screen.findByText('Secret')).toBeInTheDocument()
  })

  test('shows unauthorized message when not admin', () => {
    render(
      <AdminGuardClient>
        <div>Secret</div>
      </AdminGuardClient>
    )

    expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
  })
})
