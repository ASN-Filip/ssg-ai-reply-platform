import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'

function isAdminSession(session: Session | null) {
  return !!session && session.user?.role === 'admin'
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const resolvedParams = await params as { id: string }
  const { id } = resolvedParams

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  try {
    const updated = await prisma.locale.update({
      where: { id },
      data: {
        ...(body.code !== undefined ? { code: String(body.code).trim() } : {}),
        ...(body.displayName !== undefined ? { displayName: String(body.displayName).trim() } : {}),
        ...(body.apiKey !== undefined ? { apiKey: body.apiKey ?? null } : {}),
        ...(body.regionalNames !== undefined
          ? {
              regionalNames: (body.regionalNames as Array<unknown>)
                .map((value) => String(value).trim())
                .filter(Boolean)
                .slice(0, 5),
            }
          : {}),
        ...(body.description !== undefined ? { description: body.description ? String(body.description).trim() : null } : {}),
        ...(body.bazaarVoiceApiKey !== undefined ? { bazaarVoiceApiKey: encrypt(body.bazaarVoiceApiKey ?? null) } : {}),
        ...(body.bvResponseApiKey !== undefined ? { bvResponseApiKey: encrypt(body.bvResponseApiKey ?? null) } : {}),
        ...(body.bvClientId !== undefined ? { bvClientId: body.bvClientId ?? null } : {}),
        ...(body.bvClientSecret !== undefined ? { bvClientSecret: encrypt(body.bvClientSecret ?? null) } : {}),
        ...(body.bazaarVoiceClient !== undefined ? { bazaarVoiceClient: body.bazaarVoiceClient ?? null } : {}),
      },
    })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // remove sensitive secrets from the returned object
    const updatedRecord = updated as unknown as Record<string, unknown>
    const omit = (obj: Record<string, unknown>, keys: string[]) =>
      Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)))
    const safe = omit(updatedRecord, ['apiKey', 'bazaarVoiceApiKey', 'bvClientSecret', 'bvResponseApiKey'])
    return NextResponse.json({ locale: safe })
  } catch {
    const msg = 'Update failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resolvedParams = await params as { id: string }
  const { id } = resolvedParams

  try {
    await prisma.locale.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
