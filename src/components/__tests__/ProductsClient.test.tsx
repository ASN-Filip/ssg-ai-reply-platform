import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductsClient from '../ProductsClient'
import { products as staticProducts } from '@/data/products'
import { vi } from 'vitest'
import { renderWithClient } from '@/test/test-utils'

describe('ProductsClient', () => {
  test('shows products for default category and filters when category/subcategory clicked', async () => {
  const user = userEvent.setup()
  // mock fetch to return categories for /api/categories and products for /api/products
  let call = 0
  vi.stubGlobal('fetch', (input: RequestInfo) => {
    call += 1
    if (String(input).includes('/api/categories')) {
      return Promise.resolve(({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([{ id: 'computers', name: 'Computers', label: 'Computers', subcategories: [{ id: 'laptops', name: 'Laptops', label: 'Laptops' }] }]))
      } as unknown) as Response)
    }
    // products endpoint
    return Promise.resolve(({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(staticProducts))
    } as unknown) as Response)
  })

  renderWithClient(<ProductsClient />)

    // Default category should show the laptop product
    expect(await screen.findByText(/Notebook Ultra 14/i)).toBeInTheDocument()

    // Click Mobile category
    const mobileBtn = screen.getByRole('button', { name: /mobile/i })
    await user.click(mobileBtn)

    // Now the Galaxy S93 should be visible
    expect(await screen.findByText(/Galaxy S93/i)).toBeInTheDocument()

    // Ensure the laptop is no longer visible
    expect(screen.queryByText(/Notebook Ultra 14/i)).toBeNull()

    // Click the Accessories subcategory (should show none in our mock)
    const accessoriesBtn = screen.getByRole('button', { name: /accessories/i })
    await user.click(accessoriesBtn)

    // There are no accessories products in the mock so ensure Galaxy S93 is absent
    expect(screen.queryByText(/Galaxy S93/i)).toBeNull()
  })
})
