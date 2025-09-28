import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mocks inside the factory so they are hoisted safely by Vitest
vi.mock('@/lib/productsStore.server', () => {
  const readProducts = vi.fn()
  const writeProducts = vi.fn()
  return { readProducts, writeProducts }
})

import * as productsRoute from '@/app/api/products/route'
import * as idRoute from '@/app/api/products/[id]/route'

describe('products API route', () => {
  let store: {
    readProducts: ReturnType<typeof vi.fn>
    writeProducts: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    // dynamically import the mocked module so we get the mocked functions with proper 'mock' helpers
  // import the mocked module at runtime
  // import the mocked module at runtime
    // cast the imported module to the mocked shape so types align
    store = (await import('@/lib/productsStore.server')) as unknown as {
      readProducts: ReturnType<typeof vi.fn>
      writeProducts: ReturnType<typeof vi.fn>
    }
    // Reset mock state
    store.readProducts.mockReset()
    store.writeProducts.mockReset()
  })

  it('POST single product without id generates id and writes', async () => {
    store.readProducts.mockResolvedValue([])
    const payload = { sku: 'X1', name: 'X product', category: 'mobile', price: 10 }
    const req = new Request('http://localhost/api/products', { method: 'POST', body: JSON.stringify(payload) })
    await productsRoute.POST(req as Request)
    expect(store.writeProducts).toHaveBeenCalled()
    const arg = store.writeProducts.mock.calls[0][0]
    expect(Array.isArray(arg)).toBe(true)
    expect(arg[0].id).toBeTruthy()
    expect(arg[0].sku).toBe('X1')
  })

  it('POST array assigns ids where missing and writes array', async () => {
    const items = [ { sku: 'A', name: 'A', category: 'computers', price: 1 }, { sku: 'B', name: 'B', category: 'mobile', price: 2 } ]
    const req = new Request('http://localhost/api/products', { method: 'POST', body: JSON.stringify(items) })
    await productsRoute.POST(req as Request)
    expect(store.writeProducts).toHaveBeenCalled()
    const arg = store.writeProducts.mock.calls[0][0]
    expect(Array.isArray(arg)).toBe(true)
    expect(arg[0].id).toBeTruthy()
    expect(arg[1].id).toBeTruthy()
  })

  it('POST invalid product returns 400 and does not write', async () => {
    const invalid = { sku: 'Z', name: 'Z', category: 'mobile' }
    const req = new Request('http://localhost/api/products', { method: 'POST', body: JSON.stringify(invalid) })
    const res = await productsRoute.POST(req as Request)
    expect((res as Response).status).toBe(400)
    expect(store.writeProducts).not.toHaveBeenCalled()
  })

  it('PUT invalid merged product returns 400 and does not write', async () => {
    store.readProducts.mockResolvedValue([ { id: 'p1', sku: 'S1', name: 'Name', category: 'mobile', price: 10 } ])
    const req = new Request('http://localhost/api/products/p1', { method: 'PUT', body: JSON.stringify({ price: 'not-a-number' }) })
    // call the route handler; the second arg is the params object Next passes to handlers
  const res = await idRoute.PUT(req as Request, { params: { id: 'p1' } })
    expect((res as Response).status).toBe(400)
    expect(store.writeProducts).not.toHaveBeenCalled()
  })

  it('DELETE removes product and writes filtered list', async () => {
    store.readProducts.mockResolvedValue([ { id: 'p1', sku: 'S1' }, { id: 'p2', sku: 'S2' } ])
    const req = new Request('http://localhost/api/products/p1', { method: 'DELETE' })
    await idRoute.DELETE(req as Request, { params: { id: 'p1' } })
    expect(store.writeProducts).toHaveBeenCalled()
    const arg = store.writeProducts.mock.calls[0][0]
    expect(Array.isArray(arg)).toBe(true)
    expect(arg.find((p: Record<string, unknown>) => (p.id as string) === 'p1')).toBeUndefined()
  })
})
