import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSiteMap } from '@/lib/siteMap.server'

const CACHE_PATH = path.resolve(process.cwd(), 'node_modules', '.cache', 'site-map.json')

async function readCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeCache(data: unknown) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true })
  await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const cached = await readCache()
    if (cached) return NextResponse.json(cached)

    const map = await getSiteMap()
    await writeCache(map)
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({ error: 'failed to build site map' }, { status: 500 })
  }
}

export async function POST() {
  // allow regenerating the cache (admin action)
  try {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
    if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const map = await getSiteMap()
    await writeCache(map)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed to regenerate site map' }, { status: 500 })
  }
}
