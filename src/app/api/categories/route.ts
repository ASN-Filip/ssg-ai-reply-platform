import { NextResponse } from 'next/server'
import { readCategories, writeCategories } from '@/lib/categoriesStore.server'

export async function GET() {
  const categories = await readCategories()
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'expected array of categories' }, { status: 400 })
  }
  await writeCategories(body)
  return NextResponse.json({ ok: true })
}
