"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCategoriesStore } from '@/stores/useCategoriesStore'

export default function NewProductClient() {
  const router = useRouter()
  const categories = useCategoriesStore(state => state.categories)

  const [name, setName] = React.useState('')
  const [sku, setSku] = React.useState('')
  const [price, setPrice] = React.useState<number | ''>('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(categories[0]?.id ?? null)
  const [subcategory, setSubcategory] = React.useState<string | null>(categories[0]?.subcategories[0]?.id ?? null)

  React.useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id)
      setSubcategory(categories[0].subcategories[0]?.id ?? null)
    }
  }, [categories, category])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !sku || !price || !category) return

    const product = {
      id: sku + '-' + (Math.random() * 10000 | 0),
      sku,
      name,
      category,
      subcategory,
      price: Number(price),
      description,
    }

    try {
      await fetch('/api/products', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(product) })
      router.push('/products')
    } catch {
      // ignore for now
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium">Name</label>
  <input placeholder="Product name" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium">SKU</label>
  <input placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select title="Category" aria-label="Category" value={category ?? ''} onChange={e => setCategory(e.target.value)} className="w-full border px-3 py-2 rounded">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Subcategory</label>
          <select title="Subcategory" aria-label="Subcategory" value={subcategory ?? ''} onChange={e => setSubcategory(e.target.value)} className="w-full border px-3 py-2 rounded">
            {categories.find(c => c.id === category)?.subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
  <input placeholder="0" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} type="number" className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
  <textarea placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Product</button>
      </div>
    </form>
  )
}
