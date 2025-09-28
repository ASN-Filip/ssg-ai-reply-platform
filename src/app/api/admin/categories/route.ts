import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ParentRelationConnect = { connect: { id: string } }
type ParentRelationDisconnect = { disconnect: true }
type ParentRelationInput = ParentRelationConnect | ParentRelationDisconnect

type CreateCategoryData = {
  categoryId: string | null
  name: string
  categoryType: string | null
  label: string
  description: string | null
  aiTrainingData: string | null
  productIds: string[]
  parent?: ParentRelationConnect
}

type UpdateCategoryData = {
  name?: string
  categoryId?: string | null
  categoryType?: string | null
  label?: string
  description?: string | null
  aiTrainingData?: string | null
  parent?: ParentRelationInput
}

type RawCategory = {
  id: string
  categoryId: string | null
  name: string
  categoryType: string | null
  // new single 'label' or legacy localized labels may be present
  label?: string
  labelNlBe?: string
  labelFrBe?: string
  labelNlNl?: string
  description: string | null
  aiTrainingData: string | null
  parentId: string | null
  productIds: string[]
  createdAt: Date
  updatedAt: Date
  children?: RawCategory[]
}

function isAdminSession(session: Session | null) {
  return !!session && session.user?.role === 'admin'
}

function serializeCategory(category: RawCategory): AdminCategory {
  function computeLabel(obj?: RawCategory | null): string {
    if (!obj || typeof obj !== 'object') return ''
    return String(obj.label ?? obj.labelNlBe ?? obj.labelFrBe ?? obj.labelNlNl ?? '')
  }

  return {
    id: category.id,
    categoryId: category.categoryId ?? null,
    name: category.name,
    categoryType: category.categoryType ?? null,
    label: computeLabel(category),
    description: category.description ?? null,
    aiTrainingData: category.aiTrainingData ?? null,
    parentId: category.parentId ?? null,
    productIds: category.productIds ?? [],
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    subcategories: (category.children ?? []).map((child: RawCategory) => ({
      id: child.id,
      categoryId: child.categoryId ?? null,
      name: child.name,
      categoryType: child.categoryType ?? null,
      label: computeLabel(child),
      description: child.description ?? null,
      aiTrainingData: child.aiTrainingData ?? null,
      parentId: child.parentId ?? null,
      productIds: child.productIds ?? [],
      createdAt: child.createdAt.toISOString(),
      updatedAt: child.updatedAt.toISOString(),
      subcategories: [],
    })),
  }
}

async function fetchCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      children: {
        orderBy: [{ createdAt: 'desc' }],
      },
    },
  }) as unknown as RawCategory[]

  return categories.map((category) => serializeCategory(category))
}

function buildCreateData(body: unknown): CreateCategoryData | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>

  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const label = typeof data.label === 'string' ? data.label.trim() : ''

  if (!name || !label) return null

  const categoryId = typeof data.categoryId === 'string' && data.categoryId.trim() ? data.categoryId.trim() : undefined
  const categoryType = typeof data.categoryType === 'string' && data.categoryType.trim() ? data.categoryType.trim() : undefined
  const description = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : undefined
  const aiTrainingData = typeof data.aiTrainingData === 'string' && data.aiTrainingData.trim() ? data.aiTrainingData.trim() : undefined
  const parentId = typeof data.parentId === 'string' && data.parentId.trim() ? data.parentId.trim() : undefined

  const base: CreateCategoryData = {
    categoryId: categoryId ?? null,
    name,
    categoryType: categoryType ?? null,
    label,
    description: description ?? null,
    aiTrainingData: aiTrainingData ?? null,
    productIds: [],
  }

  if (parentId) {
    base.parent = { connect: { id: parentId } }
  }

  return base
}

function buildUpdateData(body: unknown, id: string): UpdateCategoryData | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>

  const updates: UpdateCategoryData = {}

  if (typeof data.name === 'string') {
    const name = data.name.trim()
    if (!name) return null
    updates.name = name
  }
  if (typeof data.categoryId === 'string') {
    const categoryId = data.categoryId.trim()
    updates.categoryId = categoryId || null
  }
  if (typeof data.categoryType === 'string') {
    const categoryType = data.categoryType.trim()
    updates.categoryType = categoryType || null
  }
  if (typeof data.label === 'string') {
    const label = data.label.trim()
    if (!label) return null
    updates.label = label
  }
  if (typeof data.description === 'string') {
    const description = data.description.trim()
    updates.description = description || null
  }
  if (typeof data.aiTrainingData === 'string') {
    const aiTrainingData = data.aiTrainingData.trim()
    updates.aiTrainingData = aiTrainingData || null
  }
  if (Object.prototype.hasOwnProperty.call(data, 'parentId')) {
    if (typeof data.parentId === 'string' && data.parentId.trim()) {
      const parentId = data.parentId.trim()
      if (parentId === id) return null
      updates.parent = { connect: { id: parentId } }
    } else {
      updates.parent = { disconnect: true }
    }
  }

  return Object.keys(updates).length > 0 ? updates : null
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[dev] GET /api/admin/categories called', {
        session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null } : null,
        url: req.nextUrl?.toString?.() ?? req.url,
      })
    } catch {}
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const categories = await fetchCategoryTree()
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[dev] POST /api/admin/categories called', {
        session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null } : null,
      })
    } catch {}
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const createData = buildCreateData(body)
  if (!createData) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    // prisma client types may still expect legacy localized fields in some generated typings.
    // Map the single `label` into the legacy fields as well to satisfy those typings and
    // remain compatible with older DB shapes until a full migration is complete.
    const prismaData = {
      ...createData,
      labelNlBe: createData.label,
      labelFrBe: createData.label,
      labelNlNl: createData.label,
    } as unknown as Parameters<typeof prisma.category.create>[0]["data"]

    const created = await prisma.category.create({
      data: prismaData,
      include: {
        children: { orderBy: [{ createdAt: 'desc' }] },
      },
    })

    const serialized = serializeCategory(created as RawCategory)
    return NextResponse.json({ category: serialized }, { status: 201 })
  } catch (error: unknown) {
    try {
      const maybeErr = error as { code?: string }
      if (maybeErr?.code === 'P2002') {
        return NextResponse.json({ error: 'Category name must be unique' }, { status: 400 })
      }
    } catch {}

    const message = error instanceof Error ? error.message : 'Create failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('[dev] POST /api/admin/categories error', message)
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[dev] PUT /api/admin/categories called', {
        session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null } : null,
      })
    } catch {}
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const id = typeof payload.id === 'string' ? payload.id.trim() : ''
  if (!id) {
    return NextResponse.json({ error: 'Category id is required' }, { status: 400 })
  }

  const updateData = buildUpdateData(body, id)
  if (!updateData) {
    return NextResponse.json({ error: 'No changes supplied' }, { status: 400 })
  }

    try {
    // Map label into legacy localized fields for prisma typings compatibility
    const prismaUpdateData = {
      ...updateData,
      ...(updateData.label ? { labelNlBe: updateData.label, labelFrBe: updateData.label, labelNlNl: updateData.label } : {}),
    } as unknown as Parameters<typeof prisma.category.update>[0]["data"]

    const updated = await prisma.category.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        children: {
          orderBy: [{ createdAt: 'desc' }],
        },
      },
    })

    const serialized = serializeCategory(updated as RawCategory)
    return NextResponse.json({ category: serialized })
  } catch (error: unknown) {
    try {
      const maybeErr = error as { code?: string }
      if (maybeErr?.code === 'P2025') {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      if (maybeErr?.code === 'P2002') {
        return NextResponse.json({ error: 'Category name must be unique' }, { status: 400 })
      }
    } catch {}

    const message = error instanceof Error ? error.message : 'Update failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('[dev] PUT /api/admin/categories error', message)
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[dev] DELETE /api/admin/categories called', {
        session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null } : null,
      })
    } catch {}
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const id = typeof payload.id === 'string' ? payload.id.trim() : ''
  if (!id) {
    return NextResponse.json({ error: 'Category id is required' }, { status: 400 })
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        children: {
          select: { id: true },
          take: 1,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existing.children.length > 0) {
      return NextResponse.json({ error: 'Remove subcategories first' }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('[dev] DELETE /api/admin/categories error', message)
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

type AdminCategory = {
  id: string
  categoryId: string | null
  name: string
  categoryType: string | null
  label: string
  description: string | null
  aiTrainingData: string | null
  parentId: string | null
  productIds: string[]
  createdAt: string
  updatedAt: string
  subcategories: AdminCategory[]
}