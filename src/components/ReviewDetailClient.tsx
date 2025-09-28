"use client"

import React, { useState } from 'react'

type Review = {
  id: string
  reviewer: string
  title: string
  body: string
  rating: number
  productId: string
  locale: string
  productName: string
  submittedAt: string
}

export default function ReviewDetailClient({ review }: { review: Review }) {
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [pushed, setPushed] = useState(false)

  function generateResponse() {
    // Mock AI response generation
    setAiResponse(
      "Salut Stroobant, C’est super d’entendre que tu trouves le Galaxy S25 Ultra (Online Exclusive) comme le meilleur téléphone entre tes mains ! L’appareil photo de qualité incroyable et la puissance fluide sont effectivement des atouts majeurs. Avec le Chromebook inclus, tu es vraiment bien équipé pour t’amuser et profiter au maximum de ton expérience mobile. N’oublie pas d’explorer toutes les fonctionnalités AI pour améliorer encore plus tes photos. Amuse-toi bien avec ton nouveau compagnon ! 📱✨"
    )
  }

  return (
    <article className="bg-white p-6 rounded-2xl shadow">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{review.title}</h1>
          <div className="text-sm text-gray-600">By {review.reviewer} • {new Date(review.submittedAt).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-yellow-500">{Array.from({ length: review.rating }).map(() => '★').join('')}</div>
          <div className="text-xs text-gray-500">Product ID: {review.productId}</div>
        </div>
      </header>

      <section className="mt-4 text-gray-800">
        <p>{review.body}</p>
      </section>

      <section className="mt-6">
        <button onClick={generateResponse} className="bg-samsung-blue text-white px-4 py-2 rounded">Generate AI Response</button>
        <button onClick={() => { setPushed(true) }} className="ml-2 border px-3 py-2 rounded">Pushed to Bazaar Voice</button>
      </section>

      <section className="mt-4">
        <label className="block text-sm font-semibold mb-1">AI Response</label>
        <div className="min-h-[80px] p-4 bg-gray-50 rounded">{aiResponse ?? <em className="text-gray-500">No AI response yet.</em>}</div>
      </section>

      <section className="mt-4 text-sm text-gray-600">
        <div>Language: {review.locale}</div>
        <div>Review ID: {review.id}</div>
        <div>Original Product Name: {review.productName}</div>
      </section>

      {pushed && <div className="mt-4 text-green-700 font-semibold">Pushed to Bazaar Voice</div>}
    </article>
  )
}
