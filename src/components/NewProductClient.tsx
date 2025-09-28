"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'

export default function NewProductClient() {
  const router = useRouter()
  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const categories = React.useMemo(() => categoriesData ?? [], [categoriesData])

  const [productIds, setProductIds] = React.useState('')
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [seoKeywords, setSeoKeywords] = React.useState('')
  const [languages, setLanguages] = React.useState<string[]>([])
  const [category, setCategory] = React.useState<string | null>(null)
  const [subcategory, setSubcategory] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (categories.length === 0) {
      setCategory(null)
      setSubcategory(null)
      return
    }

    setCategory((prevCategory) => {
      if (!prevCategory || !categories.some((item) => item.id === prevCategory)) {
        return categories[0]?.id ?? null
      }
      return prevCategory
    })
  }, [categories])

  React.useEffect(() => {
    if (!category) {
      setSubcategory(null)
      return
    }
    const currentCategory = categories.find((item) => item.id === category)
    if (!currentCategory) {
      setSubcategory(null)
      return
    }
    setSubcategory((prevSubcategory) => {
      if (!prevSubcategory || !currentCategory.subcategories.some((sub) => sub.id === prevSubcategory)) {
        return currentCategory.subcategories[0]?.id ?? null
      }
      return prevSubcategory
    })
  }, [categories, category])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // productIds is comma-separated list of product SKUs/IDs
    const ids = productIds.split(',').map(s => s.trim()).filter(Boolean)
    if (ids.length === 0) return
    if (!name || !category) return

    const keywords = seoKeywords.split(',').map(s => s.trim()).filter(Boolean)

    const payload = ids.map((sku) => ({
      // server will add an `id` if missing; include sku for validation
      sku,
      name,
      category,
      subcategory: subcategory ?? null,
      price: 0, // default price when not provided by the form
      description: description || null,
      seoKeywords: keywords.length ? keywords : undefined,
      languages: languages.length ? languages : undefined,
    }))

    try {
      await fetch('/api/products', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      router.push('/products')
    } catch {
      // ignore for now
    }
  }

  if (categoriesLoading) {
    return <div className="text-sm text-gray-500">Loading categories…</div>
  }

  if (categoriesError) {
    return <div className="text-sm text-red-600">Unable to load categories.</div>
  }

  if (categories.length === 0) {
    return (
      <div className="rounded border border-dashed p-6 text-sm text-gray-600">
        Create at least one category before adding products.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="label-input-field block text-sm font-medium" htmlFor="productId">Product ID (comma-separated)</label>
        <input id="productId" value={productIds} onChange={e => setProductIds(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g. SKU123, SKU124" />
      </div>
      <div>
        <label className="label-input-field block text-sm font-medium" htmlFor="name">Product Name</label>
        <input id="name" placeholder="Product name" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" />
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
        <label className="label-input-field block text-sm font-medium" htmlFor="description">Description</label>
        <textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded h-40" placeholder="Description" />
      </div>

      <div>
        <label className="label-input-field block text-sm font-medium" htmlFor="seoKeywords">SEO Keywords (comma-separated)</label>
        <input id="seoKeywords" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="keyword1, keyword2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Language (hold Cmd/Ctrl to select multiple)</label>
        <select aria-label="Language" multiple id="language" name="language" value={languages} onChange={e => {
          const opts = Array.from(e.target.selectedOptions).map(o => o.value)
          setLanguages(opts)
        }} className="w-full border px-3 py-2 rounded" size={3}>
          <option value="nl_BE">nl_BE (Dutch - Belgium)</option>
          <option value="fr_BE">fr_BE (French - Belgium)</option>
          <option value="nl_NL">nl_NL (Dutch - Netherlands)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <select title="Category" aria-label="Category" value={category ?? ''} onChange={e => setCategory(e.target.value)} className="w-full border px-3 py-2 rounded">
          <option value="" disabled>Select a Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <button type="submit" className="bg-samsung-blue text-white px-4 py-2 rounded-3xl hover:bg-blue-700 disabled:opacity-50">Create Product</button>
      </div>
    </form>
  )
}
