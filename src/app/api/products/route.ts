import { NextResponse } from 'next/server'
import { readProducts, writeProducts } from '@/lib/productsStore.server'
import { validateProduct, validateProductsArray } from '@/lib/validators.server'
import crypto from 'crypto'

export async function GET() {
  const products = await readProducts()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!Array.isArray(body) && typeof body !== 'object') {
    return NextResponse.json({ error: 'expected product object or array' }, { status: 400 })
  }

  // allow single object or full array
  if (Array.isArray(body)) {
    // ensure each product has an id
    const withIds = body.map((p) => {
      const rec = p as Record<string, unknown>
      return { id: (typeof rec.id === 'string' ? rec.id : crypto.randomUUID()), ...rec }
    })
    const res = validateProductsArray(withIds)
    if (!res.ok) return NextResponse.json({ error: res.errors }, { status: 400 })
    await writeProducts(withIds)
  } else {
  const rec = body as Record<string, unknown>
  const obj = { id: (typeof rec.id === 'string' ? rec.id : crypto.randomUUID()), ...rec }
    const val = validateProduct(obj)
    if (!val.ok) return NextResponse.json({ error: val.errors }, { status: 400 })
    const current = await readProducts()
    current.unshift(obj)
    await writeProducts(current)
  }

  return NextResponse.json({ ok: true })
}
