import React from 'react'
import Link from 'next/link'
import ReviewDetailClient from '@/components/ReviewDetailClient'

type Props = {
  params: { id: string }
}

export default function ReviewPage({ params }: Props) {
  // For now we'll use static data for id 244903898
  const id = params.id
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

  const reviewData = id === staticReview.id ? staticReview : null

  if (!reviewData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded">Review not found</div>
        <div className="mt-6">
          <Link href="/reviews" className="text-sm text-blue-600">← Back to reviews</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReviewDetailClient review={reviewData} />
      <div className="mt-6">
        <Link href="/reviews" className="text-sm text-blue-600">← Back to reviews</Link>
      </div>
    </div>
  )
}
