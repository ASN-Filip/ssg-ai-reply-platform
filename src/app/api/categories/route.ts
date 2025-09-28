import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type PublicCategory = {
  id: string
  name: string
  label: string
  categoryType?: string | null
  subcategories: Array<{
    id: string
    name: string
    label: string
    categoryType?: string | null
  }>
}

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      children: {
        orderBy: [{ createdAt: 'desc' }],
      }
    }
  })

  type CategoryWithChildren = (typeof categories)[number]
  type ChildCategory = CategoryWithChildren['children'][number]
  function computeLabel(obj: unknown) {
    // support new `label` or old localized fields
    if (!obj || typeof obj !== 'object') return ''
    const o = obj as Record<string, unknown>
    return String(o.label ?? o.labelNlBe ?? o.labelFrBe ?? o.labelNlNl ?? '')
  }

  const payload: PublicCategory[] = categories.map((category: CategoryWithChildren) => ({
    id: category.id,
    name: category.name,
    label: computeLabel(category),
    categoryType: category.categoryType,
    subcategories: (category.children ?? []).map((child: ChildCategory) => ({
      id: child.id,
      name: child.name,
      label: computeLabel(child),
      categoryType: child.categoryType,
    }))
  }))
  return NextResponse.json(payload)
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
