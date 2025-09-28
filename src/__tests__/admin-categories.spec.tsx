import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithClient } from '@/test/test-utils'
import CategoriesClient from '@/components/CategoriesClient'

// Helpers to mock fetch
function mockFetch(response: unknown, ok = true, status = 200) {
  return vi.fn(() => Promise.resolve({
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(response)),
  }))
}

const sampleCategories = [
  {
    id: 'cat1',
    categoryId: null,
    name: 'Electronics',
    categoryType: null,
    label: 'Electronics',
    description: null,
    aiTrainingData: null,
    parentId: null,
    productIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [],
  },
]

describe('Admin categories CRUD UI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ categories: sampleCategories }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders list and opens create dialog when Add category is clicked', async () => {
  renderWithClient(<CategoriesClient />)

    // wait for categories to be displayed
    await waitFor(() => expect(screen.getByText('Electronics')).toBeTruthy())

    const addButton = screen.getByText(/Add category/i)
    fireEvent.click(addButton)

    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy())
    expect(screen.getByLabelText(/Display name/i)).toBeTruthy()
  })

  it('can create a category via the form (mocked request)', async () => {
    // First fetch returns categories
    const createResponse = { category: sampleCategories[0] }
    let call = 0
    vi.stubGlobal('fetch', vi.fn(() => {
      call += 1
      if (call === 1) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ categories: sampleCategories })) })
      }
      // the POST create
      return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(createResponse)) })
    }))

  renderWithClient(<CategoriesClient />)
    await waitFor(() => expect(screen.getByText('Electronics')).toBeTruthy())

    fireEvent.click(screen.getByText(/Add category/i))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy())

    fireEvent.change(screen.getByLabelText(/Display name/i), { target: { value: 'New Cat' } })
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'New Label' } })

    fireEvent.click(screen.getByText(/Save/i))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(fetch).toHaveBeenCalledWith('/api/admin/categories', expect.objectContaining({ method: 'POST' }))
  })
})
