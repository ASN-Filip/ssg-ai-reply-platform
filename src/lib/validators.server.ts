export function validateProduct(obj: unknown) {
  const errors: string[] = []
  if (typeof obj !== 'object' || obj === null) {
    errors.push('product must be an object')
    return { ok: false, errors }
  }
  const p = obj as Record<string, unknown>
  if (!p.id || typeof p.id !== 'string') errors.push('id is required and must be a string')
  if (!p.sku || typeof p.sku !== 'string') errors.push('sku is required and must be a string')
  if (!p.name || typeof p.name !== 'string') errors.push('name is required and must be a string')
  if (!p.category || typeof p.category !== 'string') errors.push('category is required and must be a string')
  // price is optional in this app; if present it must be a number
  if (p.price !== undefined && (typeof p.price !== 'number' || Number.isNaN(p.price))) errors.push('price must be a number when provided')
  return { ok: errors.length === 0, errors }
}

export function validateProductsArray(arr: unknown) {
  if (!Array.isArray(arr)) return { ok: false, errors: ['expected array'] }
  const errors: string[] = []
  arr.forEach((x, i) => {
    const res = validateProduct(x)
    if (!res.ok) errors.push(`index ${i}: ${res.errors.join(', ')}`)
  })
  return { ok: errors.length === 0, errors }
}
