import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductDetailPage from '../[id]/page'

describe('Product detail page (server-rendered)', () => {
  test('renders product detail when id exists', () => {
    const props = { params: { id: 'SM-S938BAKDEUB' } }
  render(<ProductDetailPage {...props} />)
  // Target the main heading so we don't accidentally match duplicate labels
  expect(screen.getByRole('heading', { name: /Galaxy S93/i })).toBeInTheDocument()
  expect(screen.getByText(/SKU: SM-S938/i)).toBeInTheDocument()
  })

  test('renders not found message when id does not exist', () => {
    const props = { params: { id: 'MISSING' } }
    render(<ProductDetailPage {...props} />)
    expect(screen.getByText(/Product not found/i)).toBeInTheDocument()
  })
})
