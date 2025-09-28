"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCategoriesStore } from '@/stores/useCategoriesStore'

type Product = { id: string; sku?: string; name?: string; category?: string; subcategory?: string; price?: number; description?: string; [k: string]: unknown }

export default function EditProductClient({ id }: { id: string }) {
  const router = useRouter()
  const categories = useCategoriesStore(state => state.categories)

  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!mounted) return null
        if (!r.ok) return null
        return r.json()
      })
      .then((data: Product | null) => {
        if (!mounted) return
        setProduct(data)
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    try {
      await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(product) })
      router.push('/products')
    } catch {
      // ignore
    }
  }

  if (loading) return <div>Loading…</div>
  if (!product) return <div>Product not found</div>

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
  <label className="block text-sm font-medium">Name</label>
  <input placeholder="Product name" title="Name" value={product.name ?? ''} onChange={e => setProduct({ ...product, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
  <label className="block text-sm font-medium">SKU</label>
  <input placeholder="SKU" title="SKU" value={product.sku ?? ''} onChange={e => setProduct({ ...product, sku: e.target.value })} className="w-full border px-3 py-2 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select title="Category" aria-label="Category" value={product.category ?? ''} onChange={e => setProduct({ ...product, category: e.target.value })} className="w-full border px-3 py-2 rounded">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Subcategory</label>
          <select title="Subcategory" aria-label="Subcategory" value={product.subcategory ?? ''} onChange={e => setProduct({ ...product, subcategory: e.target.value })} className="w-full border px-3 py-2 rounded">
            {categories.find(c => c.id === product.category)?.subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
  <input placeholder="0" title="Price" value={String(product.price ?? '')} onChange={e => setProduct({ ...product, price: Number(e.target.value) })} type="number" className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
  <textarea placeholder="Short description" title="Description" value={product.description ?? ''} onChange={e => setProduct({ ...product, description: e.target.value })} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </form>
  )
}
