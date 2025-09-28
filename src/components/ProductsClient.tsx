"use client";

import React from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

type Product = {
  id: string
  sku: string
  name: string
  category: string
  subcategory?: string | null
  price: number
  description?: string
}

export default function ProductsClient() {
  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const categories = React.useMemo(() => categoriesData ?? [], [categoriesData])

  const [products, setProducts] = React.useState<Product[]>([])
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (mounted) setProducts(data) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory(null)
      setActiveSubcategory(null)
      return
    }

    setActiveCategory((prevCategory) => {
      if (!prevCategory || !categories.some((category) => category.id === prevCategory)) {
        const next = categories[0]
        return next?.id ?? null
      }
      return prevCategory
    })
  }, [categories])

  React.useEffect(() => {
    if (!activeCategory) {
      setActiveSubcategory(null)
      return
    }
    const currentCategory = categories.find((category) => category.id === activeCategory)
    if (!currentCategory) {
      setActiveSubcategory(null)
      return
    }
    setActiveSubcategory((prevSubcategory) => {
      if (!prevSubcategory || !currentCategory.subcategories.some((subcategory) => subcategory.id === prevSubcategory)) {
        return currentCategory.subcategories[0]?.id ?? null
      }
      return prevSubcategory
    })
  }, [categories, activeCategory])

  const visibleProducts = React.useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(p => p.category === activeCategory && (!activeSubcategory || p.subcategory === activeSubcategory));
  }, [activeCategory, activeSubcategory, products]);

  if (categoriesLoading) {
    return <div className="text-sm text-gray-500">Loading categories…</div>
  }

  if (categoriesError) {
    return <div className="text-sm text-red-600">Unable to load categories.</div>
  }

  if (categories.length === 0) {
    return (
      <div className="rounded border border-dashed p-6 text-sm text-gray-600">
        No categories available. Create categories in the admin area to see products grouped here.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveSubcategory(cat.subcategories[0]?.id ?? null);
              }}
              className={`px-3 py-1 rounded-2xl font-semibold ${activeCategory === cat.id ? 'bg-samsung-blue text-white' : 'bg-white text-black shadow-sm'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        <div>
          <Link href="/products/new" className="bg-green-500 text-white px-3 py-1 rounded-3xl">Add Product</Link>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          {categories.find(c => c.id === activeCategory)?.subcategories.map(sc => (
            <button
              key={sc.id}
              onClick={() => setActiveSubcategory(sc.id)}
              className={`px-2 py-1 rounded ${activeSubcategory === sc.id ? 'bg-samsung-blue text-white' : 'bg-white text-black shadow-sm'}`}>
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleProducts.map(p => (
          <article key={p.id} className="p-4 bg-white rounded-xl shadow hover:shadow-md">
            <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{p.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">€{p.price}</div>
              <div className="flex items-center space-x-2">
                <Link href={`/products/${p.id}`} className="text-samsung-blue underline">View</Link>
                <Link href={`/products/${p.id}/edit`} className="text-gray-600 underline">Edit</Link>
                <button className="text-red-500" onClick={async () => {
                  try {
                    await fetch(`/api/products/${p.id}`, { method: 'DELETE' })
                    setProducts(prev => prev.filter(x => x.id !== p.id))
                  } catch {
                    // ignore
                  }
                }}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
