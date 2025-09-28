import { NextResponse } from 'next/server'
import { readProducts, writeProducts } from '@/lib/productsStore.server'
import { validateProduct } from '@/lib/validators.server'

type Product = { id: string; [k: string]: unknown }

export async function DELETE(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await context.params
  const { id } = params
  const products = (await readProducts()) as Product[]
  const filtered = products.filter(p => p.id !== id)
  await writeProducts(filtered)
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await context.params
  const { id } = params
  const body = await request.json() as Partial<Product>
  const products = (await readProducts()) as Product[]
  const updated = products.map(p => p.id === id ? { ...p, ...body } : p)

  // validate the updated product if it exists
  const merged = updated.find(p => p.id === id)
  if (merged) {
    const res = validateProduct(merged)
    if (!res.ok) return NextResponse.json({ error: res.errors }, { status: 400 })
  }

  await writeProducts(updated)
  return NextResponse.json({ ok: true })
}

export async function GET(request: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const params = await context.params
  const { id } = params
  const products = (await readProducts()) as Product[]
  const p = products.find(x => x.id === id)
  if (!p) return new Response(null, { status: 404 })
  return new Response(JSON.stringify(p), { status: 200 })
}
