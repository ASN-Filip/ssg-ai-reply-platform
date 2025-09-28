import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductsClient from '../ProductsClient'
import { products as staticProducts } from '@/data/products'
import { vi } from 'vitest'

describe('ProductsClient', () => {
  test('shows products for default category and filters when category/subcategory clicked', async () => {
  const user = userEvent.setup()
  // mock fetch to return our static products
  vi.stubGlobal('fetch', () => Promise.resolve(({
    json: () => Promise.resolve(staticProducts)
  } as unknown) as Response))
  render(<ProductsClient />)

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
