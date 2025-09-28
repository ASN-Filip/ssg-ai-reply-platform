import React from 'react';
import { products } from '@/data/products';
import Link from 'next/link';

type Props = {
  params: { id: string };
};

export default function ProductDetailPage({ params }: Props) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Product not found</h2>
  <p className="mt-4">We couldn&apos;t find the product with id {params.id}.</p>
        <p className="mt-4">
          <Link href="/products" className="text-samsung-blue underline">Back to products</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start space-x-8">
        <div className="w-1/3 bg-gray-50 rounded-xl p-6">
          <div className="h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">Image</div>
          <div className="text-xl font-bold">{product.name}</div>
          <div className="text-sm text-gray-600">SKU: {product.sku}</div>
          <div className="mt-2 text-2xl font-extrabold">€{product.price}</div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-700 mt-4">{product.description}</p>

          <div className="mt-6">
            <h3 className="font-semibold">Category</h3>
            <p className="text-sm text-gray-600">{product.category} / {product.subcategory}</p>
          </div>

          <div className="mt-6">
            <Link href="/products" className="text-samsung-blue underline">Back to products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
