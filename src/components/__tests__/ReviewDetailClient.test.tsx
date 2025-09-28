import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewDetailClient from '../ReviewDetailClient'

const staticReview = {
  id: '244903898',
  reviewer: 'Stroobant',
  title: 'Incroyable',
  body: `En toute honnêteté, c'est le meilleur téléphone que j'ai eu entre les mains. Appareil photo de qualité incroyable, la puissance et la fluidité. Livré dans les temps et avec un Galaxy Chromebook en supplément. Le rapport qualité prix n'a jamais été aussi bien respecté. Je sens que lui et moi allons s'amuser`,
  rating: 5,
  productId: 'SM-S938BAKDEUB',
  locale: 'fr_BE',
  productName: 'Galaxy S25 Ultra (Online Exclusive)(SM-S938BAKDEUB)',
  submittedAt: '2025-09-27T13:00:02.771Z',
}

describe('ReviewDetailClient', () => {
  test('generates AI response and shows pushed confirmation', async () => {
    const user = userEvent.setup()
    render(<ReviewDetailClient review={staticReview} />)

    // Initially no AI response
    expect(screen.getByText(/No AI response yet/i)).toBeInTheDocument()

    const genBtn = screen.getByRole('button', { name: /Generate AI Response/i })
    await user.click(genBtn)

    // After generation, the French response should appear (check a snippet)
    expect(await screen.findByText(/Salut Stroobant/i)).toBeInTheDocument()

    const pushBtn = screen.getByRole('button', { name: /Pushed to Bazaar Voice/i })
    await user.click(pushBtn)

    // Confirmation appears (target the non-button div specifically)
    expect(await screen.findByText(/Pushed to Bazaar Voice/i, { selector: 'div' })).toBeInTheDocument()
  })
})
