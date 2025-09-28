import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'

const DEFAULT_LIMIT = 20

function isAdminSession(session: Session | null) {
  return !!session && session.user?.role === 'admin'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  // dev-only logging to help diagnose auth/validation issues locally
  if (process.env.NODE_ENV !== 'production') {
    try {
      // shallow session summary (avoid printing sensitive tokens or apiKey values)
      console.log('[dev] GET /api/admin/locales called', {
        session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null, email: session.user?.email ?? null } : null,
        url: req.nextUrl?.toString?.() ?? req.url,
      })
    } catch {}
  }
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const limitRaw = url.searchParams.get('limit')
  const cursor = url.searchParams.get('cursor')
  const q = url.searchParams.get('q') || undefined
  const limit = Math.min(Number(limitRaw || DEFAULT_LIMIT) || DEFAULT_LIMIT, 100)

  // build a generic where object (avoid importing Prisma generated types here)
  const where: Record<string, unknown> | undefined = q
    ? {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
          { regionalNames: { has: q } },
        ],
      }
    : undefined

  // shape find args to be structurally compatible with Prisma's findMany args
  const findArgs: {
    where?: Record<string, unknown>
    take?: number
    orderBy?: { id: 'asc' }
    select?: { id: true; code: true; displayName: true; regionalNames: true; description: true; createdAt: true; updatedAt: true }
    cursor?: { id: string }
    skip?: number
  } = {
    where,
    take: limit + 1,
    orderBy: { id: 'asc' },
    select: { id: true, code: true, displayName: true, regionalNames: true, description: true, createdAt: true, updatedAt: true },
  }

  if (cursor) {
    findArgs.cursor = { id: cursor }
    findArgs.skip = 1
  }

  try {
    const items = await prisma.locale.findMany(findArgs)
    let nextCursor: string | null = null
    if (items.length > limit) {
      const next = items.pop()
      nextCursor = next?.id ?? null
    }
    return NextResponse.json({ locales: items, nextCursor })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'List failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('[dev] GET /api/admin/locales error:', { message: msg, err })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  // dev-only logging to help diagnose auth/validation issues locally
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[dev] POST /api/admin/locales called', { session: session ? { userId: session.user?.id ?? null, role: session.user?.role ?? null } : null })
    } catch {}
  }
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  // basic validation
  if (!body || !body.code || !body.displayName) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dev] POST /api/admin/locales invalid body:', body)
    }
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    const created = await prisma.locale.create({
      data: {
        code: String(body.code).trim(),
        displayName: String(body.displayName).trim(),
        apiKey: body.apiKey ?? null,
        // encrypt sensitive keys before persisting
        bazaarVoiceApiKey: encrypt(body.bazaarVoiceApiKey ?? null),
        bvResponseApiKey: encrypt(body.bvResponseApiKey ?? null),
        bvClientId: body.bvClientId ?? null,
        bvClientSecret: encrypt(body.bvClientSecret ?? null),
        bazaarVoiceClient: body.bazaarVoiceClient ?? null,
        regionalNames: Array.isArray(body.regionalNames)
          ? (body.regionalNames as Array<unknown>).map((x) => String(x).trim()).filter(Boolean).slice(0, 5)
          : [],
        description: body.description ? String(body.description).trim() : null,
        createdBy: session?.user?.id ?? null,
      },
    })
    // do not return apiKey — return explicit fields
    // do not return secrets (apiKey and encrypted secrets) in the response
    const rest = {
      id: created.id,
      code: created.code,
      displayName: created.displayName,
      // safe BV identifiers only
      bvClientId: created.bvClientId,
      bazaarVoiceClient: created.bazaarVoiceClient,
      regionalNames: created.regionalNames,
      description: created.description,
      createdBy: created.createdBy,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    }
    return NextResponse.json({ locale: rest }, { status: 201 })
  } catch (err: unknown) {
    // Prisma unique constraint errors typically surface with code 'P2002'.
    // We avoid importing runtime types here and instead check safely.
    try {
      const maybeErr = err as { code?: string }
      if (maybeErr && maybeErr.code === 'P2002') {
        return NextResponse.json({ error: 'Locale code already exists' }, { status: 400 })
      }
    } catch {
      // ignore
    }
    const msg = err instanceof Error ? err.message : 'Create failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('[dev] POST /api/admin/locales error:', { message: msg, err })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
