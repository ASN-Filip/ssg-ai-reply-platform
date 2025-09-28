import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const role = cookieStore.get('role')?.value
    if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const body = await req.json()
    const routePath = body.path as string
    const title = body.title as string || 'Placeholder'

    const slug = routePath.replace(/\//g, '-').replace(/[^a-zA-Z0-9_-]/g, '') || 'placeholder'
    const dir = path.resolve(process.cwd(), 'content', 'placeholders')
    await fs.mkdir(dir, { recursive: true })
    const file = path.join(dir, `${slug}.md`)
    const content = `---\ntitle: "${title}"\nroute: "${routePath}"\n---\n\n# ${title}\n\nPlaceholder for ${routePath}\n`
    await fs.writeFile(file, content, 'utf-8')

    return NextResponse.json({ ok: true, file })
  } catch {
    return NextResponse.json({ error: 'failed to create placeholder' }, { status: 500 })
  }
}
