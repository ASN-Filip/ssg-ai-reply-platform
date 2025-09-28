// Simple in-memory locales store for admin APIs and dev use.
// Implements validation/sanitization inspired by the provided Mongoose schema.

type Locale = {
  id: string
  code: string
  displayName: string
  apiKey?: string | null
  regionalNames: string[]
  description?: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

const nowIso = () => new Date().toISOString()

function sanitizeRegionalNames(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map(s => (typeof s === 'string' ? s.trim().slice(0, 200) : ''))
    .filter(Boolean)
    .slice(0, 5)
}

function normalizeCode(code: unknown): string | null {
  if (!code || typeof code !== 'string') return null
  return code.trim()
}

// Module-level in-memory store. In dev this persists across requests but is not a replacement for a DB.
const store: Locale[] = []

function generateId() {
  return `l${Date.now()}${Math.random().toString(36).slice(2, 8)}`
}

export async function listLocales({ q, cursor, limit }: { q?: string; cursor?: string | null; limit?: number }) {
  const take = Math.min(limit ?? 20, 100)
  let items = [...store]
  if (q) {
    const low = q.toLowerCase()
    items = items.filter(l => l.code.toLowerCase().includes(low) || l.displayName.toLowerCase().includes(low) || (l.regionalNames || []).some(n => n.toLowerCase().includes(low)))
  }
  items.sort((a, b) => a.id.localeCompare(b.id))
  if (cursor) {
    const i = items.findIndex(x => x.id === cursor)
    if (i >= 0) items = items.slice(i + 1)
  }
  const slice = items.slice(0, take + 1)
  let nextCursor: string | null = null
  if (slice.length > take) {
    const next = slice.pop()
    nextCursor = next?.id ?? null
  }
  // do not return apiKey by default
  const itemsNoKey = slice.map((item) => {
    const copy = { ...item } as Partial<Locale>
    delete copy.apiKey
    return copy
  })
  return { locales: itemsNoKey, nextCursor }
}

export async function getLocale(id: string, { includeApiKey = false }: { includeApiKey?: boolean } = {}) {
  const l = store.find(x => x.id === id) || null
  if (!l) return null
  if (includeApiKey) return { ...l }
  const copy = { ...l } as Partial<Locale>
  delete copy.apiKey
  return copy
}

export async function createLocale(payload: Partial<Locale> & { createdBy?: string | null }) {
  const code = normalizeCode(payload.code)
  const displayName = typeof payload.displayName === 'string' ? payload.displayName.trim() : ''
  if (!code) throw new Error('code is required')
  if (!displayName) throw new Error('displayName is required')
  // enforce unique code (case-insensitive)
  const existing = store.find(s => s.code.toLowerCase() === code.toLowerCase())
  if (existing) throw new Error('Locale code already exists')

  const now = nowIso()
  const l = {
    id: generateId(),
    code,
    displayName,
    apiKey: payload.apiKey ?? null,
    regionalNames: sanitizeRegionalNames(payload.regionalNames ?? []),
    description: typeof payload.description === 'string' ? payload.description.trim() : null,
    createdBy: payload.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
  }
  store.push(l)
  const copy: Partial<Locale> = { ...l }
  delete copy.apiKey
  return { locale: copy }
}

export async function updateLocale(id: string, body: Partial<Locale>) {
  const idx = store.findIndex(s => s.id === id)
  if (idx < 0) return null
  const current = store[idx]
  if (body.code) {
    const code = normalizeCode(body.code)
    if (!code) throw new Error('code cannot be empty')
    // ensure uniqueness
    const other = store.find(s => s.id !== id && s.code.toLowerCase() === code.toLowerCase())
    if (other) throw new Error('Locale code already exists')
    current.code = code
  }
  if (body.displayName !== undefined) current.displayName = String(body.displayName).trim()
  if (body.apiKey !== undefined) current.apiKey = body.apiKey ?? null
  if (body.regionalNames !== undefined) current.regionalNames = sanitizeRegionalNames(body.regionalNames)
  if (body.description !== undefined) current.description = body.description ? String(body.description).trim() : null
  current.updatedAt = nowIso()
  const copy = { ...current } as Partial<Locale>
  delete copy.apiKey
  store[idx] = current
  return { locale: copy }
}

export async function deleteLocale(id: string) {
  const idx = store.findIndex(s => s.id === id)
  if (idx < 0) return false
  store.splice(idx, 1)
  return true
}

// seed helper for tests/dev
export function seedLocales(initial: Array<Partial<Locale>> = []) {
  store.length = 0
  for (const item of initial) {
    const now = nowIso()
    store.push({
      id: generateId(),
      code: normalizeCode(item.code) ?? `lc-${Math.random().toString(36).slice(2,6)}`,
      displayName: (item.displayName ?? 'Unnamed').toString().trim(),
      apiKey: item.apiKey ?? null,
      regionalNames: sanitizeRegionalNames(item.regionalNames ?? []),
      description: item.description ? String(item.description).trim() : null,
      createdBy: item.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export type { Locale }
